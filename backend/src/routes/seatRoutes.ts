import { Router } from "express";

import {
  getSeatsBySchedule,
  createSeat,
  updateSeat,
  deleteSeat,
} from "../controllers/seatController";

import { authenticate } from "../middlewares/authMiddleware";

import { authorizeRole } from "../middlewares/roleMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Seats
 *   description: Seat Management API
 */

/**
 * @swagger
 * /seats/{scheduleId}:
 *   get:
 *     summary: Get seats by schedule
 *     tags: [Seats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Seats fetched successfully
 */
router.get("/:scheduleId", authenticate, getSeatsBySchedule);

/**
 * @swagger
 * /seats:
 *   post:
 *     summary: Create new seat (Admin only)
 *     tags: [Seats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduleId:
 *                 type: integer
 *               seatNumber:
 *                 type: string
 *               status:
 *                 type: string
 *                 example: available
 *     responses:
 *       201:
 *         description: Seat created successfully
 */
router.post("/", authenticate, authorizeRole("admin"), createSeat);

/**
 * @swagger
 * /seats/{id}:
 *   put:
 *     summary: Update seat (Admin only)
 *     tags: [Seats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seatNumber:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Seat updated successfully
 */
router.put("/:id", authenticate, authorizeRole("admin"), updateSeat);

/**
 * @swagger
 * /seats/{id}:
 *   delete:
 *     summary: Delete seat (Admin only)
 *     tags: [Seats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Seat deleted successfully
 */
router.delete("/:id", authenticate, authorizeRole("admin"), deleteSeat);

export default router;
