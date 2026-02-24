import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import uploadImageToCloudinary from "../utils/cloudinaryUpload.js";

// API for doctor Login 
const loginDoctor = async (req, res) => {
    try {

        const { email, password } = req.body
        const user = await doctorModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor appointments
const appointmentsDoctor = async (req, res) => {
    try {

        const docId = req.docId
        // FIX: Include cancelled appointments so doctor can see them (will filter in frontend)
        const appointments = await appointmentModel
            .find({ docId, paymentStatus: "PAID" })
            .sort({ createdAt: -1 })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Cancel appointment
const appointmentCancel = async (req, res) => {
    try {

        const docId = req.docId
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {
            // FIX: Track doctor cancellation with metadata
            await appointmentModel.findByIdAndUpdate(appointmentId, { 
                cancelled: true,
                cancelledBy: "doctor",
                cancelledAt: new Date()
            })
            return res.json({ success: true, message: 'Appointment Cancelled' })
        }

        res.json({ success: false, message: 'Unauthorized action' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Complete appointment
const appointmentComplete = async (req, res) => {
    try {

        const docId = req.docId
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {
            // [SOCKET] Prevent duplicate DB updates and duplicate emits
            if (appointmentData.isCompleted) {
                return res.json({ success: true, message: 'Appointment already completed' })
            }

            const updatedAppointment = await appointmentModel.findByIdAndUpdate(
                appointmentId,
                { isCompleted: true },
                { new: true }
            )

            // [SOCKET] Emit to affected user room only AFTER successful DB update
            try {
                const io = req.app.get('io')
                if (io && appointmentData.userId) {
                    io.to(`user:${appointmentData.userId}`).emit('appointment:updated', {
                        appointmentId: updatedAppointment?._id || appointmentId,
                        userId: appointmentData.userId,
                        docId,
                        isCompleted: true,
                        updatedAt: new Date().toISOString()
                    })
                }
            } catch (emitError) {
                // [SOCKET] Emit failure should not break REST success response
                console.error('Socket emit failed for appointment:updated', emitError)
            }

            return res.json({ success: true, message: 'Appointment Completed' })
        }

        res.json({ success: false, message: 'Unauthorized action' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Get doctors list
const doctorList = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Change availability
const changeAvailablity = async (req, res) => {
    try {

        const docId = req.docId

        const docData = await doctorModel.findById(docId)
        if (!docData) {
            return res.status(404).json({ success: false, message: 'Doctor not found' })
        }
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })

        res.json({ success: true, message: 'Availability Changed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Get doctor profile
const doctorProfile = async (req, res) => {
    try {

        const docId = req.docId
        const profileData = await doctorModel.findById(docId).select('-password')

        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ✅ UPDATED: Update doctor profile (with working hours support)
const updateDoctorProfile = async (req, res) => {
    try {

        const docId = req.docId

        if (!docId) {
            return res.json({ success: false, message: "Doctor ID missing" })
        }

        const fees = Number(req.body.fees)
        const available = req.body.available === "true" || req.body.available === true
        const about = req.body.about

        const address = typeof req.body.address === "string"
            ? JSON.parse(req.body.address)
            : req.body.address

        // ✅ NEW: Get working hours from request
        const startTime = req.body.startTime
        const endTime = req.body.endTime

        const updateData = {
            fees,
            address,
            available,
            about
        }

        // ✅ Add workingHours only if provided
        if (startTime && endTime) {
            updateData.workingHours = {
                startTime,
                endTime
            }
        }

        if (req.file) {
            const imageUrl = await uploadImageToCloudinary(req.file.path)
            updateData.image = imageUrl
        }

        const updatedDoctor = await doctorModel.findByIdAndUpdate(
            docId,
            updateData,
            { new: true }
        )

        if (!updatedDoctor) {
            return res.json({ success: false, message: "Doctor not found" })
        }

        res.json({ success: true, message: "Profile Updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Dashboard data
const doctorDashboard = async (req, res) => {
    try {

        const docId = req.docId
        const appointments = await appointmentModel.find({ docId, paymentStatus: "PAID" })

        // FIX: Filter out cancelled appointments for earnings and count calculations
        const activeAppointments = appointments.filter(item => !item.cancelled)

        let earnings = 0
        activeAppointments.forEach((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients = []
        activeAppointments.forEach((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    doctorList,
    changeAvailablity,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile
}