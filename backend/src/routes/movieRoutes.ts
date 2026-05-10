import { Router } from "express";

import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movieController";

import { authenticate } from "../middlewares/authMiddleware";
import { authorizeRole } from "../middlewares/roleMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Movie Management API
 */

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get all movies
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Movies fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get("/", getMovies);

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Get movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Movie fetched successfully
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getMovieById);

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Create new movie (Admin only)
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - genre
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *                 example: Avengers Endgame
 *               genre:
 *                 type: string
 *                 example: Action
 *               duration:
 *                 type: integer
 *                 example: 180
 *               description:
 *                 type: string
 *                 example: Epic Marvel movie
 *     responses:
 *       201:
 *         description: Movie created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post("/", authenticate, authorizeRole("admin"), createMovie);

/**
 * @swagger
 * /movies/{id}:
 *   put:
 *     summary: Update movie (Admin only)
 *     tags: [Movies]
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
 *               title:
 *                 type: string
 *               genre:
 *                 type: string
 *               duration:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", authenticate, authorizeRole("admin"), updateMovie);

/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Delete movie (Admin only)
 *     tags: [Movies]
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
 *         description: Movie deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authenticate, authorizeRole("admin"), deleteMovie);

export default router;
