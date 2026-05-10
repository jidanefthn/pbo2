import { Request, Response } from "express";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { eq } from "drizzle-orm";

import { db } from "../db";
import { users } from "../db/schema/users";

import { AuthRequest } from "../middlewares/authMiddleware";

// ========================================
// GENERATE JWT TOKEN
// ========================================

const generateToken = (id: number, role: string) => {
  return jwt.sign(
    {
      id,
      role,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    }
  );
};

// ========================================
// REGISTER USER
// ========================================

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });

      return;
    }

    // Check existing user
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      res.status(400).json({
        success: false,
        message: "Email already registered",
      });

      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: "user",
      })
      .returning();

    // Generate token
    const token = generateToken(newUser[0].id, newUser[0].role);

    // Response
    res.status(201).json({
      success: true,
      message: "User registered successfully",

      token,

      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        role: newUser[0].role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register user",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

// ========================================
// REGISTER ADMIN
// ========================================

export const registerAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });

      return;
    }

    // Check existing admin
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingAdmin.length > 0) {
      res.status(400).json({
        success: false,
        message: "Email already registered",
      });

      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const newAdmin = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: "admin",
      })
      .returning();

    // Generate token
    const token = generateToken(newAdmin[0].id, newAdmin[0].role);

    // Response
    res.status(201).json({
      success: true,
      message: "Admin registered successfully",

      token,

      user: {
        id: newAdmin[0].id,
        name: newAdmin[0].name,
        email: newAdmin[0].email,
        role: newAdmin[0].role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register admin",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

// ========================================
// LOGIN
// ========================================

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });

      return;
    }

    // Find user
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length === 0) {
      res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });

      return;
    }

    const user = existingUser[0];

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });

      return;
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    // Response
    res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

// ========================================
// GET PROFILE
// ========================================

export const getProfile = async (
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

    // Find user
    const existingUser = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (existingUser.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });

      return;
    }

    // Response
    res.status(200).json({
      success: true,
      user: existingUser[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get profile",

      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
