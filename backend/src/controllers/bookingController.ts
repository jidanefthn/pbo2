import { Response } from "express";

import { eq, inArray } from "drizzle-orm";

import { db } from "../db";

import { bookings } from "../db/schema/bookings";
import { bookingSeats } from "../db/schema/bookingSeats";
import { seats } from "../db/schema/seats";
import { schedules } from "../db/schema/schedules";

import { AuthRequest } from "../middlewares/authMiddleware";

export const createBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const { scheduleId, seatIds } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });

      return;
    }

    if (scheduleId === undefined || !seatIds || !Array.isArray(seatIds)) {
      res.status(400).json({
        success: false,
        message: "Schedule ID and seat IDs are required",
      });

      return;
    }

    if (seatIds.length === 0) {
      res.status(400).json({
        success: false,
        message: "Please select at least one seat",
      });

      return;
    }

    const existingSchedule = await db
      .select()
      .from(schedules)
      .where(eq(schedules.id, scheduleId));

    if (existingSchedule.length === 0) {
      res.status(404).json({
        success: false,
        message: "Schedule not found",
      });

      return;
    }

    const selectedSeats = await db
      .select()
      .from(seats)
      .where(inArray(seats.id, seatIds));

    if (selectedSeats.length !== seatIds.length) {
      res.status(404).json({
        success: false,
        message: "Some seats were not found",
      });

      return;
    }

    const bookedSeat = selectedSeats.find((seat) => seat.status === "booked");

    if (bookedSeat) {
      res.status(400).json({
        success: false,
        message: `Seat ${bookedSeat.seatNumber} is already booked`,
      });

      return;
    }

    const totalPrice = existingSchedule[0].price * seatIds.length;

    const newBooking = await db
      .insert(bookings)
      .values({
        userId,
        scheduleId,
        totalPrice,
        status: "confirmed",
      })
      .returning();

    for (const seatId of seatIds) {
      await db.insert(bookingSeats).values({
        bookingId: newBooking[0].id,
        seatId,
      });
    }

    for (const seatId of seatIds) {
      await db
        .update(seats)
        .set({
          status: "booked",
        })
        .where(eq(seats.id, seatId));
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully",

      booking: {
        id: newBooking[0].id,
        userId: newBooking[0].userId,
        scheduleId: newBooking[0].scheduleId,
        totalPrice: newBooking[0].totalPrice,
        status: newBooking[0].status,
        createdAt: newBooking[0].createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create booking",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const getBookingHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });

      return;
    }

    const userBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId));

    res.status(200).json({
      success: true,
      total: userBookings.length,

      bookings: userBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking history",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
