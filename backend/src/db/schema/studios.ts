import {
  boolean,
  integer,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";

export const studios = pgTable("studios", {
  id: serial("id").primaryKey(),

  name: varchar("name", {
    length: 100,
  }).notNull(),

  totalSeats: integer("total_seats").notNull(),

  isActive: boolean("is_active").notNull().default(true),
});
