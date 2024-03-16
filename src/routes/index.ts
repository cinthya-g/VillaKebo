import { Router } from "express";
import authRoutes from "./auth";
import ownerRoutes from "./owner";

const router = Router();

router.use("/auth", authRoutes);

router.use("/owner", ownerRoutes);

router.get("/", (req, res) => {
    res.send('API works!');
});

export default router;