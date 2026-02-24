import mongoose from "mongoose"

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },

    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },

    userData: { type: Object, required: true },
    docData: { type: Object, required: true },

    amount: { type: Number, required: true },

    date: { type: Number, required: true },

    cancelled: { type: Boolean, default: false },

    // 🔹 NEW PAYMENT SYSTEM
    paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED"],
        default: "PENDING"
    },

    paymentOrderId: {
        type: String,
        default: ""
    },

    paymentSessionId: {
        type: String,
        default: ""
    },

    isCompleted: { type: Boolean, default: false },

    // FIX: Track who cancelled and when
    cancelledBy: {
        type: String,
        enum: ["user", "doctor"],
        default: null
    },

    cancelledAt: {
        type: Date,
        default: null
    }

}, { timestamps: true })

const appointmentModel =
    mongoose.models.appointment ||
    mongoose.model("appointment", appointmentSchema)

export default appointmentModel