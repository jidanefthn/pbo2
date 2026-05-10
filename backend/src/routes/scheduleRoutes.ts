import { Router } from "express";

import {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../controllers/scheduleController";

import { authenticate } from "../middlewares/authMiddleware";
import { authorizeRole } from "../middlewares/roleMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: Movie Schedule API
 */

/**
 * @swagger
 * /schedules:
 *   get:
 *     summary: Get all schedules
 *     tags: [Schedules]
 *     responses:
 *       200:
 *         description: Schedules fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get("/", getSchedules);

/**
 * @swagger
 * /schedules/{id}:
 *   get:
 *     summary: Get schedule by ID
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Schedule fetched successfully
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getScheduleById);

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: Create new schedule (Admin only)
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movieId
 *               - studioId
 *               - price
 *               - showDate
 *               - showTime
 *             properties:
 *               movieId:
 *                 type: integer
 *                 example: 1
 *               studioId:
 *                 type: integer
 *                 example: 1
 *               price:
 *                 type: integer
 *                 example: 50000
 *               showDate:
 *                 type: string
 *                 example: 2026-05-08
 *               showTime:
 *                 type: string
 *                 example: 19:00:00
 *     responses:
 *       201:
 *         description: Schedule created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post("/", authenticate, authorizeRole("admin"), createSchedule);

/**
 * @swagger
 * /schedules/{id}:
 *   put:
 *     summary: Update schedule (Admin only)
 *     tags: [Schedules]
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
 *               movieId:
 *                 type: integer
 *               studioId:
 *                 type: integer
 *               price:
 *                 type: integer
 *               showDate:
 *                 type: string
 *               showTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", authenticate, authorizeRole("admin"), updateSchedule);

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     summary: Delete schedule (Admin only)
 *     tags: [Schedules]
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
 *         description: Schedule deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authenticate, authorizeRole("admin"), deleteSchedule);

export default router;
