import { Request, Response } from "express";

import { eq } from "drizzle-orm";

import { db } from "../db";

import { schedules } from "../db/schema/schedules";
import { movies } from "../db/schema/movies";
import { studios } from "../db/schema/studios";

export const getSchedules = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const allSchedules = await db.select().from(schedules);

    res.status(200).json({
      success: true,
      total: allSchedules.length,

      schedules: allSchedules,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch schedules",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const getScheduleById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const scheduleId = Number(req.params.id);

    const schedule = await db
      .select()
      .from(schedules)
      .where(eq(schedules.id, scheduleId));

    if (schedule.length === 0) {
      res.status(404).json({
        success: false,
        message: "Schedule not found",
      });

      return;
    }

    res.status(200).json({
      success: true,

      schedule: schedule[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch schedule",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const createSchedule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { movieId, studioId, price, showDate, showTime } = req.body;

    if (!movieId || !studioId || !price || !showDate || !showTime) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });

      return;
    }

    const existingMovie = await db
      .select()
      .from(movies)
      .where(eq(movies.id, movieId));

    if (existingMovie.length === 0) {
      res.status(404).json({
        success: false,
        message: "Movie not found",
      });

      return;
    }

    const existingStudio = await db
      .select()
      .from(studios)
      .where(eq(studios.id, studioId));

    if (existingStudio.length === 0) {
      res.status(404).json({
        success: false,
        message: "Studio not found",
      });

      return;
    }

    const newSchedule = await db
      .insert(schedules)
      .values({
        movieId,
        studioId,
        price,
        showDate,
        showTime,
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Schedule created successfully",

      schedule: newSchedule[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create schedule",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const updateSchedule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const scheduleId = Number(req.params.id);

    const { movieId, studioId, price, showDate, showTime } = req.body;

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

    const updatedSchedule = await db
      .update(schedules)
      .set({
        movieId,
        studioId,
        price,
        showDate,
        showTime,
      })
      .where(eq(schedules.id, scheduleId))
      .returning();

    res.status(200).json({
      success: true,
      message: "Schedule updated successfully",

      schedule: updatedSchedule[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update schedule",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const deleteSchedule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const scheduleId = Number(req.params.id);

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

    await db.delete(schedules).where(eq(schedules.id, scheduleId));

    res.status(200).json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete schedule",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
