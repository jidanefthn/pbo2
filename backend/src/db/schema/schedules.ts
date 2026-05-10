import { date, integer, pgTable, serial, time } from "drizzle-orm/pg-core";

import { movies } from "./movies";
import { studios } from "./studios";

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),

  movieId: integer("movie_id")
    .references(() => movies.id)
    .notNull(),

  studioId: integer("studio_id")
    .references(() => studios.id)
    .notNull(),

  price: integer("price").notNull(),

  showDate: date("show_date").notNull(),

  showTime: time("show_time").notNull(),
});
