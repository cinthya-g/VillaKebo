import { Router } from "express";
import path from "path";
import authRoutes from "./auth";
import googleRouter from "./google-passport";
import ownerRoutes from "./owner";
import caretakerRouter from "./caretaker";
import notificationRouter from "./notification";

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
 * paths:
 *   /owner:
 *     summary: Caretaker routes
 *     description: Includes routes related to pet caretaker operations like managing pet groups and activities.
 */
router.use("/caretaker", caretakerRouter);

/**
 * @swagger
 * paths:
 *   /notification:
 *     summary: Notification routes
 *     description: Includes routes related to notifications.
 */
router.use("/notification", notificationRouter);

/**
 * @swagger
 * paths:
 *   /google-passport:
 *     summary: Google authentication routes
 *     description: Includes routes related to Google authentication.
 */
router.use("/google-passport", googleRouter);

//test4
router.get("/", (req, res) => {
    console.log("(index routes) The path is: ", path.join(__dirname, '..', '..', 'public', 'index.html'));
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
});


export default router;