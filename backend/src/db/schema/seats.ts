import { integer, pgEnum, pgTable, serial, varchar } from "drizzle-orm/pg-core";

import { schedules } from "./schedules";

export const seatStatusEnum = pgEnum("seat_status", ["available", "booked"]);

export const seats = pgTable("seats", {
  id: serial("id").primaryKey(),

  scheduleId: integer("schedule_id")
    .references(() => schedules.id)
    .notNull(),

  seatNumber: varchar("seat_number", {
    length: 10,
  }).notNull(),

  status: seatStatusEnum("status").default("available").notNull(),
});
