import axios from "axios"
import appointmentModel from "../models/appointmentModel.js"

const CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg/orders"

// =========================
// PHONE VALIDATION HELPER
// =========================
const validatePhone = (phone) => {
  if (!phone) return "9999999999"

  phone = phone.toString().trim()

  if (/^[6-9]\d{9}$/.test(phone)) return phone
  if (/^\+\d{10,15}$/.test(phone)) return phone

  return "9999999999"
}

// =========================
// CREATE PAYMENT ORDER
// =========================
export const createPaymentOrder = async (req, res) => {
  try {
    const { appointmentId } = req.body

    if (!appointmentId) {
      return res.json({ success: false, message: "Appointment ID required" })
    }

    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" })
    }

    if (appointment.cancelled) {
      return res.json({ success: false, message: "Appointment cancelled" })
    }

    // 🔥 If already paid, don't create new order
    if (appointment.paymentStatus === "PAID") {
      return res.json({ success: false, message: "Appointment already paid" })
    }

    const orderId = "order_" + appointment._id

    const orderData = {
      order_id: orderId,
      order_amount: Number(appointment.amount),
      order_currency: "INR",
      customer_details: {
        customer_id: appointment.userId.toString(),
        customer_email: appointment.userData?.email || "test@example.com",
        customer_phone: validatePhone(appointment.userData?.phone),
        customer_name: appointment.userData?.name || "Test User"
      },
      order_meta: {
        return_url:
          "http://localhost:5173/payment-status?order_id={order_id}"
      }
    }

    console.log("📦 Creating Cashfree order:", orderId)

    const response = await axios.post(CASHFREE_BASE_URL, orderData, {
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2023-08-01"
      }
    })

    // Save order details
    appointment.paymentOrderId = orderId
    appointment.paymentSessionId = response.data.payment_session_id
    appointment.paymentStatus = "PENDING"

    await appointment.save()

    console.log("✅ Order created & saved:", orderId)

    return res.json({
      success: true,
      paymentSessionId: response.data.payment_session_id
    })
  } catch (error) {
    console.log("❌ Cashfree Error:", error.response?.data || error.message)

    return res.json({
      success: false,
      message: error.response?.data?.message || error.message
    })
  }
}

// =========================
// VERIFY PAYMENT
// =========================
export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params

    if (!orderId) {
      return res.json({ success: false, message: "Order ID required" })
    }

    console.log("🔍 Verifying payment for:", orderId)

    const response = await axios.get(
      `${CASHFREE_BASE_URL}/${orderId}`,
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2023-08-01"
        }
      }
    )

    const orderStatus = response.data.order_status

    console.log("📊 Cashfree status:", orderStatus)

    const appointment = await appointmentModel.findOne({
      paymentOrderId: orderId
    })

    if (!appointment) {
      return res.json({
        success: false,
        message: "Appointment not found"
      })
    }

    // 🔥 IMPORTANT FIX
    if (orderStatus === "PAID") {
      appointment.paymentStatus = "PAID"
      appointment.payment = true
      // ✅ DO NOT auto-complete appointment. Doctor must mark complete separately.
    } else if (orderStatus === "ACTIVE") {
      appointment.paymentStatus = "PENDING"
    } else {
      appointment.paymentStatus = "FAILED"
      appointment.payment = false
    }

    await appointment.save()

    console.log("✅ Appointment updated successfully")

    return res.json({
      success: true,
      status: orderStatus
    })
  } catch (error) {
    console.log("❌ Verify Error:", error.response?.data || error.message)

    return res.json({
      success: false,
      message: error.response?.data?.message || error.message
    })
  }
}