import { serveStatic, upgradeWebSocket } from 'hono/deno'
import { Hono } from 'hono'
import type { WSContext } from 'hono/ws'
import { getDuration, getFull, getSchedules, getSpeed, setDuration, setSchedules, setSpeed } from "./db/actions.ts";
import { sign, decode, verify } from "hono/jwt"
import { boolean } from "drizzle-orm/gel-core";
import { TZDate } from "npm:@date-fns/tz";

const secretKey = Deno.env.get("SECRET_KEY")!;

const app = new Hono()
interface Schedule {
  hour: number,
  minute: number
}
interface Setting {
  speed: number,
  duration: number,
  schedules: Schedule[],
}
let isOnline = false;
let tmpSchedule: Schedule | null = null;
let timeout = 0;

let filteredSchedule: (c: Schedule) => boolean = () => true;
const actionToSchedule: ((hour: number, minute: number) => (void | Promise<void>))[] = [];

const parseSchedules = async () => {
  const r = [
    ...(await getSchedules()),
    ...(tmpSchedule === null ? [] : [tmpSchedule]),
  ].filter(filteredSchedule);
  console.log(r);
  return r;
}

const clients: WSContext<WebSocket>[] = [];
const devices: WSContext<WebSocket>[] = [];
//const setting: Setting = {
//  duration: 360,
//  speed: 5,
//  schedules: [
//    { hour: 8, minute: 40 },
//    { hour: 13, minute: 0 },
//    { hour: 15, minute: 0 },
//  ]
//};
//const idleTimeout = 3;

app
  .use('/public/*', serveStatic({ path: './public' }))
  .get('/token', async (c) => {
    const payload = {
      sub: 'user',
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
    };
    const token = await sign(payload, secretKey);
    return c.json({
      message: "Successfully create token",
      token
    })
  })
  .get('/settings', async (c) => {
    //return c.json(setting);
    return c.json(await getFull());
  })
  .post('/settings', async (c) => {
    const body = await c.req.json() as Partial<Setting>;
    console.log(body);
    if (body.duration) {
      //setting.duration = body.duration;
      await setDuration(body.duration);
      devices.forEach(x => x.send("SET_DURATION, " + body.duration));
    }
    if (body.schedules) {
      //setting.schedules.splice(0, setting.schedules.length);
      //setting.schedules.push(...body.schedules);
      await setSchedules(body.schedules);
      const txt = ["SET_FEEDING", ...(await parseSchedules()).map(x => [ x.hour, x.minute ])].flat().join(", ");
      console.log(txt);
      devices.forEach(x => x.send(txt));
    }
    if (body.speed) {
      //setting.speed = body.speed;
      await setSpeed(body.speed);
      devices.forEach(x => x.send("SET_SPEED, " + body.speed));
    }
    clients.forEach(x => x.send(JSON.stringify({ cmd: "refresh" })));
    return c.json({ ok: true, message: "Successfully set" })
  })
  .get('/ws/client', (c, next) => {
    return upgradeWebSocket(() => ({
      onOpen(e, ws) {
        //setTimeout(() => {
        clients.push(ws);
        console.log("Connected clients: ", clients.length);
        //}, idleTimeout * 1000 + 100)
      },
      onClose(e, ws) {
        clients.splice(clients.indexOf(ws), 1);
        console.log("Connected clients: ", clients.length);
      },
      onMessage(e, ws) {
        const data = JSON.parse(e.data.toString());
        console.log("data from clients: ", e.data.toString(), ", device length: ", devices.length);
        devices.forEach(x => {
          if (Object.hasOwn(data, "cmd") && typeof data.cmd === 'string') {
            switch (data.cmd) {
              case "getStatusRun":
                x.send("GET_STATUS_RUN");
                break;
              case "start": {
                console.log("Start")
                x.send("GET_TIME");
                actionToSchedule.push(async (hour, minute) => {
                  tmpSchedule = { hour, minute };
                  filteredSchedule = () => true;
                  x.send(["SET_FEEDING", ...(await parseSchedules()).map(x => [ x.hour, x.minute ])].flat().join(", "))
                })
                break;
              }
              case "stop": {
                x.send("GET_TIME");
                actionToSchedule.push(async (hour, minute) => {
                  const duration = await getDuration();
                  const time = hour * 3600 + minute * 60;
                  filteredSchedule = c => {
                    const t = c.hour * 3600 + c.minute * 60;
                    const r = !( time >= t && time < t + duration!);
                    return r;
                  };
                  x.send(["SET_FEEDING", ...(await parseSchedules()).map(x => [ x.hour, x.minute ])].flat().join(", "))
                  filteredSchedule = () => true;
                });
                break;
              }
              default: ;
            }
          } else x.send(data);
        })
        isOnline = !isOnline;
        clients.filter(x => x != ws).forEach(x => x.send(`${isOnline}`));
      },
    }))(c, next)
  })
  .get('/ws/device', (c, next) => {
    return upgradeWebSocket(() => ({
      async onOpen(e, ws) {
        //setTimeout(() => {
        devices.push(ws);
        console.log("Connected devices: ", devices.length);
        const speed = await getSpeed();
        const schedules = await parseSchedules();
        const duration = await getDuration();
        const txt = ["SET_FEEDING", ...schedules.map(x => [ x.hour, x.minute ])].flat().join(", ");
        ws.send("SET_SPEED, " + speed)
        ws.send(txt);
        ws.send("SET_DURATION, " + duration)
        //}, idleTimeout * 1000 + 100)
      },
      onClose(e, ws) {
        devices.splice(devices.indexOf(ws), 1);
        console.log("Connected devices: ", devices.length);
      },
      async onMessage(e, ws) {
        const data = e.data.toString();
        console.log("data from devices: ", data);
        const re = /^(?<hour>\d{1,2}):(?<minute>\d{1,2})$/;
        if (data.length >= 3 && data.length <= 5 && re.test(data) && actionToSchedule.length > 0) {
          const match = data.match(re);
          const hour = parseInt(match!.groups!.hour)
          const minute = parseInt(match!.groups!.minute);
          const fn = actionToSchedule.shift();
          fn!(hour, minute);
          return;
        }
        const splitted = data.split(",").map(x => x.toLowerCase().trim());
        console.log("splitted to: ", JSON.stringify(splitted));
        const cmd = splitted.shift();
        console.log(JSON.stringify({ cmd, splitted }, null, 2));
        switch (cmd) {
          case "status_run": {
            isOnline = JSON.parse(splitted.at(0) || "false");
            const data: { isOnline: boolean, timeout?: number } = { isOnline };
            const t = splitted.at(1);
            if (t && /^\d+$/.test(t)) {
              timeout = parseInt(t);
              data.timeout = timeout;
            }
            clients.forEach(x => x.send(JSON.stringify(data)));
            break;
          }
          case "set_speed":
            await setSpeed(parseInt(splitted.at(0) || "1"));
            clients.forEach(x => x.send(JSON.stringify({ cmd: "refresh" })));
            break;
          case "set_feeding": {
            await setSchedules(splitted.map(x => {
              const y = x.split(":").map(x => x.trim());
              return {
                hour: parseInt(y.at(0) || "0"),
                minute: parseInt(y.at(1) || "0"),
              };
            }));
            clients.forEach(x => x.send(JSON.stringify({ cmd: "refresh" })));
            break;
          }
          default:
            ;
        }
      },
    }))(c, next)
  })

Deno.serve(app.fetch)
