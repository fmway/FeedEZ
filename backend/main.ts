import { serveStatic, upgradeWebSocket } from 'hono/deno'
import { Hono } from 'hono'
import type { WSContext } from 'hono/ws'

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

const clients: WSContext<WebSocket>[] = [];
const devices: WSContext<WebSocket>[] = [];
const setting: Setting = {
  duration: 360,
  speed: 5,
  schedules: [
    { hour: 8, minute: 40 },
    { hour: 13, minute: 0 },
    { hour: 15, minute: 0 },
  ]
};
const idleTimeout = 3;

app
  .use('/public/*', serveStatic({ path: './public' }))
  .get('/settings', (c) => {
    return c.json(setting);
  })
  .post('/settings', async (c) => {
    const body = await c.req.json() as Partial<Setting>;
    if (body.duration) {
      setting.duration = body.duration;
      devices.forEach(x => x.send("SET_DURATION, " + body.duration));
    }
    if (body.schedules) {
      setting.schedules.splice(0, setting.schedules.length);
      setting.schedules.push(...body.schedules);
      const txt = ["SET_FEEDING", ...setting.schedules.map(x => [ x.hour, x.minute ])].flat().join(", ");
      devices.forEach(x => x.send(txt));
    }
    if (body.speed) {
      setting.speed = body.speed;
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
        console.log("data from clients: ", e.data.toString());
        devices.forEach(x => {
          if (Object.hasOwn(data, "cmd") && typeof data.cmd === 'string') {
            switch (data.cmd) {
              case "getStatusRun":
                x.send("GET_STATUS_RUN");
                break;
              default:
                ;
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
      onOpen(e, ws) {
        //setTimeout(() => {
        devices.push(ws);
        console.log("Connected devices: ", devices.length);
        const txt = ["SET_FEEDING", ...setting.schedules.map(x => [ x.hour, x.minute ])].flat().join(", ");
        ws.send("SET_SPEED, " + setting.speed)
        ws.send(txt);
        ws.send("SET_DURATION, " + setting.duration)
        //}, idleTimeout * 1000 + 100)
      },
      onClose(e, ws) {
        devices.splice(devices.indexOf(ws), 1);
        console.log("Connected devices: ", devices.length);
      },
      onMessage(e, ws) {
        console.log("data from devices: ", e.data.toString());
        const splitted = e.data.toString().split(",").map(x => x.toLowerCase().trim());
        console.log("splitted to: ", JSON.stringify(splitted));
        const cmd = splitted.shift();
        console.log(JSON.stringify({ cmd, splitted }, null, 2));
        switch (cmd) {
          case "status_run":
            isOnline = JSON.parse(splitted.at(0) || "false");
            clients.forEach(x => x.send(JSON.stringify({ isOnline })));
            break;
          case "set_speed":
            setting.speed = parseInt(splitted.at(0) || "1");
            clients.forEach(x => x.send(JSON.stringify({ cmd: "refresh" })));
            break;
          case "set_feeding": {
            setting.schedules.splice(0, setting.schedules.length);
            setting.schedules.push(...splitted.map(x => {
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
