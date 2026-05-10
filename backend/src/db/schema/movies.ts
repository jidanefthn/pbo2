import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),

  title: varchar("title", {
    length: 255,
  }).notNull(),

  genre: varchar("genre", {
    length: 100,
  }).notNull(),

  duration: integer("duration").notNull(),

  description: text("description"),

  posterUrl: text("poster_url"),
});
