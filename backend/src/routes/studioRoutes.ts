import { Router } from "express";

import {
  getStudios,
  getStudioById,
  createStudio,
  updateStudio,
  deleteStudio,
} from "../controllers/studioController";

import { authenticate } from "../middlewares/authMiddleware";
import { authorizeRole } from "../middlewares/roleMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Studios
 *   description: Studio Management API
 */

/**
 * @swagger
 * /studios:
 *   get:
 *     summary: Get all studios
 *     tags: [Studios]
 *     responses:
 *       200:
 *         description: Studios fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get("/", getStudios);

/**
 * @swagger
 * /studios/{id}:
 *   get:
 *     summary: Get studio by ID
 *     tags: [Studios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Studio fetched successfully
 *       404:
 *         description: Studio not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getStudioById);

/**
 * @swagger
 * /studios:
 *   post:
 *     summary: Create new studio (Admin only)
 *     tags: [Studios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - totalSeats
 *             properties:
 *               name:
 *                 type: string
 *                 example: Studio 1
 *               totalSeats:
 *                 type: integer
 *                 example: 50
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Studio created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post("/", authenticate, authorizeRole("admin"), createStudio);

/**
 * @swagger
 * /studios/{id}:
 *   put:
 *     summary: Update studio (Admin only)
 *     tags: [Studios]
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
 *               name:
 *                 type: string
 *               totalSeats:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Studio updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Studio not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", authenticate, authorizeRole("admin"), updateStudio);

/**
 * @swagger
 * /studios/{id}:
 *   delete:
 *     summary: Delete studio (Admin only)
 *     tags: [Studios]
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
 *         description: Studio deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Studio not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authenticate, authorizeRole("admin"), deleteStudio);

export default router;
