import React, { useContext } from 'react'
import { DoctorContext } from './context/DoctorContext';
import { AdminContext } from './context/AdminContext';
import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AllUsers from './pages/Admin/AllUsers';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import Login from './pages/Login';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';

const App = () => {

  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)

  const isAdminLoggedIn = Boolean(aToken)
  const isDoctorLoggedIn = Boolean(dToken)

  if (!isAdminLoggedIn && !isDoctorLoggedIn) {
    return (
      <>
        <ToastContainer />
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
      </>
    )
  }

  return (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Routes>
          {isAdminLoggedIn ? (
            <>
              <Route path='/' element={<Navigate to='/dashboard' replace />} />
              <Route path='/login' element={<Navigate to='/dashboard' replace />} />
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/admin-dashboard' element={<Navigate to='/dashboard' replace />} />
              <Route path='/all-appointments' element={<AllAppointments />} />
              <Route path='/all-users' element={<AllUsers />} />
              <Route path='/add-doctor' element={<AddDoctor />} />
              <Route path='/doctor-list' element={<DoctorsList />} />
              <Route path='*' element={<Navigate to='/dashboard' replace />} />
            </>
          ) : (
            <>
              <Route path='/' element={<Navigate to='/doctor-dashboard' replace />} />
              <Route path='/login' element={<Navigate to='/doctor-dashboard' replace />} />
              <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
              <Route path='/doctor-appointments' element={<DoctorAppointments />} />
              <Route path='/doctor-profile' element={<DoctorProfile />} />
              <Route path='*' element={<Navigate to='/doctor-dashboard' replace />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  )
}

export default App


/* 
“App.jsx acts as the application shell and authentication gate. It consumes both Admin and Doctor contexts to determine whether a user is authenticated. Based on token presence, it conditionally renders either the dashboard layout or the login screen. It defines all routes using React Router and includes shared layout components like Navbar and Sidebar. This structure keeps routing, authentication gating, and layout logic centralized.”
*/