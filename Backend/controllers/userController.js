import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import uploadImageToCloudinary from "../utils/cloudinaryUpload.js";
import admin from "../firebaseAdmin.js";

// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
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
        /* 
        What is salt?

        Random string added to password before hashing
        Prevents rainbow table attacks

        // User password: "password123"
        // Salt: "x$2a$10$abcdefgh"
        // Hash input: "password123x$2a$10$abcdefgh"
        // Final hash: "$2a$10$abcdefgh...randomstring..."
        */
        

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to login user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {

    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {

    try {

        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {
            // upload image to cloudinary
            const imageURL = await uploadImageToCloudinary(imageFile.path)
            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to book appointment 
const bookAppointment = async (req, res) => {

    try {

        const { userId, docId, slotDate, slotTime } = req.body
        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        // ✅ Rule 1: Check if user already has an appointment with this doctor on the same date
        const existingAppointment = await appointmentModel.findOne({
            userId,
            docId,
            slotDate,
            cancelled: false,
            isCompleted: false
        })

        if (existingAppointment) {
            return res.status(409).json({
                success: false,
                message: `You already have an appointment with this doctor on ${slotDate} at ${existingAppointment.slotTime}`
            })
        }

        // ✅ Rule 2: Check if user already has an appointment with same specialty on the same date (different doctor)
        const specialtyAppointment = await appointmentModel.findOne({
            userId,
            'docData.speciality': docData.speciality,
            slotDate,
            docId: { $ne: docId },
            cancelled: false,
            isCompleted: false
        })

        if (specialtyAppointment) {
            return res.status(409).json({
                success: false,
                message: `You already have a ${docData.speciality} appointment on ${slotDate} at ${specialtyAppointment.slotTime}`
            })
        }

        // ✅ Rule 3: Check if user already has any appointment at the same time on the same date
        const timeClashAppointment = await appointmentModel.findOne({
            userId,
            slotDate,
            slotTime,
            cancelled: false,
            isCompleted: false
        })

        if (timeClashAppointment) {
            return res.status(409).json({
                success: false,
                message: `You already have another appointment at this time on ${slotDate}`
            })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select("-password")

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Booked' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// ✅ HELPER FUNCTION: Parse appointment time and validate cancellation window
const validateCancellationWindow = (slotDate, slotTime) => {
    try {
        // Parse slotDate format: "DD_MM_YYYY"
        const [day, month, year] = slotDate.split('_').map(Number)
        
        // Parse slotTime format: "HH:MM"
        const [hour, minute] = slotTime.split(':').map(Number)
        
        // Construct appointment datetime (month is 0-indexed in JS)
        const appointmentTime = new Date(year, month - 1, day, hour, minute, 0, 0).getTime()
        
        // Get current time
        const currentTime = Date.now()
        
        // Calculate 1 hour before appointment
        const oneHourBefore = appointmentTime - (60 * 60 * 1000)
        
        // Check if appointment has already passed
        if (currentTime > appointmentTime) {
            return { 
                isValid: false, 
                error: 'Appointment has already passed. Cannot cancel.' 
            }
        }
        
        // Check if within cancellation window (less than 1 hour before appointment)
        if (currentTime >= oneHourBefore) {
            return { 
                isValid: false, 
                error: 'Cannot cancel within 1 hour of appointment time.' 
            }
        }
        
        return { isValid: true }
        
    } catch (error) {
        return { 
            isValid: false, 
            error: 'Invalid appointment date/time format.' 
        }
    }
}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        // 1️⃣ Check appointment exists
        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        // 2️⃣ Verify appointment belongs to user
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        // 3️⃣ Check if already cancelled
        if (appointmentData.cancelled === true) {
            return res.json({ success: false, message: 'Appointment already cancelled' })
        }

        // 4️⃣ Check if completed
        if (appointmentData.isCompleted === true) {
            return res.json({ success: false, message: 'Cannot cancel a completed appointment' })
        }

        // FIX: Allow unpaid appointment cancellation - validate 1-hour window ONLY for paid appointments
        if (appointmentData.paymentStatus === 'PAID') {
            const timeValidation = validateCancellationWindow(appointmentData.slotDate, appointmentData.slotTime)
            if (!timeValidation.isValid) {
                return res.json({ success: false, message: timeValidation.error })
            }
        }

        // FIX: Save cancellation with metadata (who cancelled, when)
        await appointmentModel.findByIdAndUpdate(appointmentId, { 
            cancelled: true,
            cancelledBy: "user",
            cancelledAt: new Date()
        })

        // ✅ EXISTING LOGIC: Release doctor slot (unchanged)
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ✅ API to check if a day is available for booking (Rule 1 & Rule 2)
const checkDayAvailability = async (req, res) => {
    try {
        const { docId, slotDate } = req.query
        const userId = req.userId

        if (!docId || !slotDate) {
            return res.json({ success: false, message: 'Missing parameters' })
        }

        // Fetch doctor to get specialty
        const docData = await doctorModel.findById(docId).select('speciality')
        if (!docData) {
            return res.json({ success: false, message: 'Doctor not found' })
        }

        // Rule 1: Check if user has appointment with same doctor on same date
        const rule1Conflict = await appointmentModel.findOne({
            userId,
            docId,
            slotDate,
            cancelled: false,
            isCompleted: false
        })

        if (rule1Conflict) {
            return res.json({
                success: true,
                isDayBlocked: true
            })
        }

        // Rule 2: Check if user has appointment with same specialty on same date
        const rule2Conflict = await appointmentModel.findOne({
            userId,
            'docData.speciality': docData.speciality,
            slotDate,
            cancelled: false,
            isCompleted: false
        })

        if (rule2Conflict) {
            return res.json({
                success: true,
                isDayBlocked: true
            })
        }

        // No conflicts found
        return res.json({
            success: true,
            isDayBlocked: false
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body
        // FIX: Exclude unpaid cancelled appointments - only show unpaid if not cancelled, or show all paid (cancelled or not)
        const appointments = await appointmentModel.find({ 
            userId,
            $or: [
                { cancelled: false },
                { cancelled: true, paymentStatus: "PAID" }
            ]
        })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for Google Login
const googleLogin = async (req, res) => {
    try {

        const { token } = req.body;

        if (!token) {
            return res.json({ success: false, message: "Token missing" })
        }

        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);

        const { email, name, picture } = decodedToken;

        let user = await userModel.findOne({ email });

        // If user doesn't exist → create one
        if (!user) {
            user = await userModel.create({
                name,
                email,
                image: picture,
                password: "" // no password for google users
            });
        }

        // Generate JWT
        const jwtToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET
        );

        res.json({ success: true, token: jwtToken });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Google Login Failed" });
    }
};

export {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    checkDayAvailability,
    googleLogin
}