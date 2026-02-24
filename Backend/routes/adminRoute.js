import express from 'express';
import {
  loginAdmin,
  appointmentsAdmin,
  addDoctor,
  allDoctors,
  adminDashboard,
  changeAvailability,
  getAllUsers
} from '../controllers/adminController.js';

import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';

const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin);
adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.get("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailability); // ✅ Correct
adminRouter.get("/dashboard", authAdmin, adminDashboard);
adminRouter.get("/users", authAdmin, getAllUsers);

export default adminRouter;

/* 

Responsibility: Admin panel API endpoints (doctor management, monitoring)
Base URL: /api/admin/*
Used by: Admin frontend dashboard
Pattern: Login public, everything else protected

*/