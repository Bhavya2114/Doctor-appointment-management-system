import express from 'express';
import { loginUser, registerUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, checkDayAvailability, googleLogin } from '../controllers/userController.js';
import upload from '../middleware/multer.js';
import authUser from '../middleware/authUser.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.post("/google-login", googleLogin);

userRouter.get("/get-profile", authUser, getProfile)
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile)
userRouter.get("/check-day-availability", authUser, checkDayAvailability)
userRouter.post("/book-appointment", authUser, bookAppointment)
userRouter.get("/appointments", authUser, listAppointment)
userRouter.post("/cancel-appointment", authUser, cancelAppointment)


export default userRouter;

/*

File Purpose in Architecture
Responsibility: Define all patient/user-facing API endpoints
Base URL: /api/user/* (set in server.js)
Used by: Frontend user pages (Home, Appointment, MyProfile, etc.)
Pattern: Public auth endpoints + Protected user endpoints

*/