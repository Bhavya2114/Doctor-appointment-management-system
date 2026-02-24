import express from "express"
import { createPaymentOrder, verifyPayment } from "../controllers/paymentController.js"

const router = express.Router()

// Create payment order
router.post("/create-order", createPaymentOrder)

// Verify payment after redirect (Demo version)
router.get("/verify/:orderId", verifyPayment)

export default router