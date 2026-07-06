import { Router } from "express";

import {
  createBooking,
  getBookingHistory,
  getAllBookings, // 🌟 1. Pastikan fungsi ini di-import!
} from "../controllers/bookingController";

import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

// Rute untuk user biasa
router.post("/", authenticate, createBooking);
router.get("/history", authenticate, getBookingHistory);

// 🌟 2. INI RUTE YANG HILANG: Rute untuk laporan admin (global)
router.get("/all", authenticate, getAllBookings);

export default router;