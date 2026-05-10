import { Request, Response } from "express";

import { eq } from "drizzle-orm";

import { db } from "../db";

import { seats } from "../db/schema/seats";
import { schedules } from "../db/schema/schedules";

export const getSeatsBySchedule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const scheduleId = Number(req.params.scheduleId);

    if (!scheduleId) {
      res.status(400).json({
        success: false,
        message: "Schedule ID is required",
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

    const scheduleSeats = await db
      .select()
      .from(seats)
      .where(eq(seats.scheduleId, scheduleId));

    res.status(200).json({
      success: true,
      total: scheduleSeats.length,

      seats: scheduleSeats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch seats",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const createSeat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { scheduleId, seatNumber, status } = req.body;

    if (!scheduleId || !seatNumber) {
      res.status(400).json({
        success: false,
        message: "Schedule ID and seat number are required",
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

    const newSeat = await db
      .insert(seats)
      .values({
        scheduleId,
        seatNumber,
        status: status || "available",
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Seat created successfully",

      seat: newSeat[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create seat",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const updateSeat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const seatId = Number(req.params.id);

    const { seatNumber, status } = req.body;

    const existingSeat = await db
      .select()
      .from(seats)
      .where(eq(seats.id, seatId));

    if (existingSeat.length === 0) {
      res.status(404).json({
        success: false,
        message: "Seat not found",
      });

      return;
    }

    const updatedSeat = await db
      .update(seats)
      .set({
        seatNumber,
        status,
      })
      .where(eq(seats.id, seatId))
      .returning();

    res.status(200).json({
      success: true,
      message: "Seat updated successfully",

      seat: updatedSeat[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update seat",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const deleteSeat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const seatId = Number(req.params.id);

    const existingSeat = await db
      .select()
      .from(seats)
      .where(eq(seats.id, seatId));

    if (existingSeat.length === 0) {
      res.status(404).json({
        success: false,
        message: "Seat not found",
      });

      return;
    }

    await db.delete(seats).where(eq(seats.id, seatId));

    res.status(200).json({
      success: true,
      message: "Seat deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete seat",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
