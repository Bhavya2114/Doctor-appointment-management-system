import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import uploadImageToCloudinary from "../utils/cloudinaryUpload.js";

// API for admin login
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
 

}


// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({ paymentStatus: "PAID" })
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for adding Doctor
const addDoctor = async (req, res) => {

    try {

        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
        const imageFile = req.file
        console.log(imageFile);

        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)
        
        // upload image to cloudinary
        const imageUrl = await uploadImageToCloudinary(imageFile.path)
        

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()
        res.json({ success: true, message: 'Doctor Added' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({ paymentStatus: "PAID", cancelled: false })
        const latestAppointments = await appointmentModel.find({ paymentStatus: "PAID" })
            .sort({ createdAt: -1 })
            .limit(5)

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin Change Doctor Availability
const changeAvailability = async (req, res) => {
    try {

        const { docId } = req.body   // 👈 IMPORTANT

        const doctor = await doctorModel.findById(docId)

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            })
        }

        doctor.available = !doctor.available
        await doctor.save()

        res.json({
            success: true,
            message: "Availability Changed"
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// API to get all users with total bookings count
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.aggregate([
            {
                $lookup: {
                    from: "appointments",
                    let: { userId: { $toString: "$_id" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$userId", "$$userId"] } } }
                    ],
                    as: "userAppointments"
                }
            },
            {
                $addFields: {
                    totalBookings: { $size: "$userAppointments" }
                }
            },
            {
                $project: {
                    password: 0,
                    
                }
            }
        ])

        res.json({ success: true, users })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


export {
    loginAdmin,
    appointmentsAdmin,
    addDoctor,
    allDoctors,
    adminDashboard,
    changeAvailability,
    getAllUsers
}