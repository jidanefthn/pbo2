import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users";
import { schedules } from "./schedules";

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),

  scheduleId: integer("schedule_id")
    .references(() => schedules.id)
    .notNull(),

  totalPrice: integer("total_price").notNull(),

  status: text("status").notNull().default("confirmed"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
