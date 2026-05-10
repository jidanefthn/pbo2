import { integer, pgTable, serial } from "drizzle-orm/pg-core";

import { bookings } from "./bookings";
import { seats } from "./seats";

export const bookingSeats = pgTable("booking_seats", {
  id: serial("id").primaryKey(),

  bookingId: integer("booking_id")
    .references(() => bookings.id)
    .notNull(),

  seatId: integer("seat_id")
    .references(() => seats.id)
    .notNull(),
});
