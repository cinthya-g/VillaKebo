import { Router } from "express";
import authRoutes from "./auth";
import ownerRoutes from "./owner";
/**
 * @swagger
 * tags:
 *   - name: API
 *     description: API General Endpoints
 */
const router = Router();
/**
 * @swagger
 * paths:
 *   /auth:
 *     summary: Authentication routes
 *     description: Includes all authentication related routes like login, register, etc.
 */
router.use("/auth", authRoutes);
/**
 * @swagger
 * paths:
 *   /owner:
 *     summary: Owner routes
 *     description: Includes routes related to pet owner operations like creating or deleting pets.
 */
router.use("/owner", ownerRoutes);
/**
 * @swagger
 * /:
 *  get:
 *    summary: Root endpoint
 *    description: Returns a message indicating the API is working.
 *    tags: [API]
 *    responses:
 *      200:
 *        description: API is up and running
 *        content:
 *          text/plain:
 *            schema:
 *              type: string
 *              example: API works!
 */

router.get("/", (req, res) => {
    res.send('API works!');
});

export default router;