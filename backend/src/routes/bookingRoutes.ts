import { Router } from "express";

import {
  createBooking,
  getBookingHistory,
} from "../controllers/bookingController";

import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Ticket Booking API
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scheduleId
 *               - seatIds
 *             properties:
 *               scheduleId:
 *                 type: integer
 *                 example: 1
 *               seatIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Invalid request or seat already booked
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Schedule or seat not found
 *       500:
 *         description: Internal server error
 */
router.post("/", authenticate, createBooking);

/**
 * @swagger
 * /bookings/history:
 *   get:
 *     summary: Get current user booking history
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking history fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/history", authenticate, getBookingHistory);

export default router;
