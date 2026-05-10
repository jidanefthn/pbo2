import { Request, Response } from "express";

import { eq } from "drizzle-orm";

import { db } from "../db";

import { studios } from "../db/schema/studios";

export const getStudios = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const allStudios = await db.select().from(studios);

    res.status(200).json({
      success: true,
      total: allStudios.length,

      studios: allStudios,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch studios",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const getStudioById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const studioId = Number(req.params.id);

    const studio = await db
      .select()
      .from(studios)
      .where(eq(studios.id, studioId));

    if (studio.length === 0) {
      res.status(404).json({
        success: false,
        message: "Studio not found",
      });

      return;
    }

    res.status(200).json({
      success: true,

      studio: studio[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch studio",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const createStudio = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, totalSeats, isActive } = req.body;

    if (!name || !totalSeats) {
      res.status(400).json({
        success: false,
        message: "Name and total seats are required",
      });

      return;
    }

    const newStudio = await db
      .insert(studios)
      .values({
        name,
        totalSeats,
        isActive,
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Studio created successfully",

      studio: newStudio[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create studio",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const updateStudio = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const studioId = Number(req.params.id);

    const { name, totalSeats, isActive } = req.body;

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

    const updatedStudio = await db
      .update(studios)
      .set({
        name,
        totalSeats,
        isActive,
      })
      .where(eq(studios.id, studioId))
      .returning();

    res.status(200).json({
      success: true,
      message: "Studio updated successfully",

      studio: updatedStudio[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update studio",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const deleteStudio = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const studioId = Number(req.params.id);

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

    await db.delete(studios).where(eq(studios.id, studioId));

    res.status(200).json({
      success: true,
      message: "Studio deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete studio",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
