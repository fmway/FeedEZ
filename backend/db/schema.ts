import { sql } from "drizzle-orm";
import { text, integer, check, sqliteTable } from "drizzle-orm/sqlite-core";

export const setting = sqliteTable("setting", {
  id:
    integer("id")
    .primaryKey({ autoIncrement: true }),
  speed:
    integer("speed", { mode: 'number' })
    .default(4),
  duration:
    integer("duration", { mode: 'number' })
    .default(300),
}, table => [
  check("speed_check1", sql`${table.speed} > 0 AND ${table.speed} < 6`),
  check("duration_check1", sql`${table.duration} > 0`),
]);

export const schedule = sqliteTable("schedule", {
  id:
    integer("id")
    .primaryKey({ autoIncrement: true }),
  hour:
    integer("hour", { mode: 'number' })
    .notNull(),
  minute:
    integer("minute", { mode: 'number' })
    .notNull(),
  settingId:
    integer("setting_id")
    .references(() => setting.id),
}, table => [
  check('hour_check1', sql`${table.hour} > -1 AND ${table.hour} < 24`),
  check('minute_check1', sql`${table.minute} > -1 AND ${table.minute} < 60`),
])

export type InsertSchedule = typeof schedule.$inferInsert;
export type SelectSchedule = typeof schedule.$inferSelect;

export type InsertSetting = typeof setting.$inferInsert;
export type SelectSetting = typeof setting.$inferSelect;

export interface Schedule {
  hour: number,
  minute: number
}
export interface Setting {
  speed: number,
  duration: number,
  schedules: Schedule[],
}
