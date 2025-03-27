import { eq, sql } from "drizzle-orm";
import { db } from "./index.ts";
import { setting, schedule, Schedule, Setting } from "./schema.ts";
import { duration } from "drizzle-orm/gel-core";

export async function getSpeed() {
  const [ { speed }, ] = await db
    .select({ speed: setting.speed })
    .from(setting)
    .where(sql`${setting.id} = 1`)
    .limit(1);
  return speed;
}

export async function setSpeed(speed: number) {
  const [ res, ] = await db
    .update(setting)
    .set({ speed })
    //.limit(1)
    .where(eq(setting.id, 1))
    .returning();

  return res;
}

export async function getDuration() {
  const [ { duration }, ] = await db
    .select({ duration: setting.duration })
    .from(setting)
    .where(eq(setting.id, 1))
    .limit(1);
  return duration;
}

export async function setDuration(duration: number) {
  const [ res, ] = await db
    .update(setting)
    .set({ duration })
    //.limit(1)
    .where(eq(setting.id, 1))
    .returning();

  return res;
}

export async function getSchedules() {
  const res = await db
    .select({
      hour: schedule.hour,
      minute: schedule.minute,
    })
    .from(schedule)
    .where(eq(schedule.settingId, 1))
  return res;
}

export async function setSchedules(schedules: Schedule[]) {
  await db
    .delete(schedule)
    .where(eq(schedule.settingId, 1));

  const res = await db
    .insert(schedule)
    .values(schedules.map(({ hour, minute }) => ({
      settingId: 1,
      hour,
      minute,
    })))
    .returning();

  return res;
}

export async function getFull(): Promise<Setting> {
  const [ set, ] = await db
    .select({
      speed: setting.speed,
      duration: setting.duration,
    })
    .from(setting)
    .where(eq(setting.id, 1))
    .limit(1);
  return {
    schedules: await db
      .select({
        hour: schedule.hour,
        minute: schedule.minute,
      })
      .from(schedule)
      .where(eq(schedule.settingId, 1)),
    speed: set.speed!,
    duration: set.duration!,
  }
}

// console.log(await getSpeed())
//console.log(await setSchedules([
//  { hour: 8, minute: 10 },
//  { minute: 9, hour: 3 },
//  { minute: 2, hour: 4 },
//  { minute: 9, hour: 5 },
//]))
//console.log(await setSpeed(2))
