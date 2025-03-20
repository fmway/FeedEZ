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
    }
    if (body.schedules) {
      setting.schedules.splice(0, setting.schedules.length);
      setting.schedules.push(...body.schedules);
    }
    if (body.speed) {
      setting.speed = body.speed;
    }
    return c.json({ ok: true, message: "Successfully set" })
  })
  .get('/ws/client', (c, next) => {
    return upgradeWebSocket(() => ({
      onOpen(e, ws) {
        setTimeout(() => {
          clients.push(ws);
          console.log("Connected clients: ", clients.length);
        }, idleTimeout * 1000 + 100)
      },
      onClose(e, ws) {
        clients.splice(clients.indexOf(ws), 1);
        console.log("Connected clients: ", clients.length);
      },
      onMessage(e, ws) {
        console.log("data from clients: ", e.data.toString());
        devices.forEach(x => x.send(e.data.toString()))
        isOnline = !isOnline;
        clients.filter(x => x != ws).forEach(x => x.send(`${isOnline}`));
      },
    }))(c, next)
  })
  .get('/ws/device', (c, next) => {
    return upgradeWebSocket(() => ({
      onOpen(e, ws) {
        setTimeout(() => {
          devices.push(ws);
          console.log("Connected devices: ", devices.length);
        }, idleTimeout * 1000 + 100)
      },
      onClose(e, ws) {
        devices.splice(devices.indexOf(ws), 1);
        console.log("Connected devices: ", devices.length);
      },
      onMessage(e, ws) {
        console.log("data from devices: ", e.data.toString());
      },
    }))(c, next)
  })

Deno.serve(app.fetch)
