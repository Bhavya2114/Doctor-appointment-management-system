import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { NavLink } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'

const Sidebar = () => {

  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer
   transition-all duration-300 hover:translate-x-1 hover:scale-[1.02]
   ${isActive
      ? 'bg-[#F2F3FF] border-r-4 border-primary scale-[1.02] shadow-sm'
      : 'hover:bg-gray-50'
    }`

  return (
    <div className='min-h-screen bg-white border-r'>

      {aToken && (
        <ul className='text-[#515151] mt-5'>

          <NavLink to='/dashboard' className={linkClass}>
            <img className='min-w-5 transition-transform duration-300 hover:scale-110' src={assets.home_icon} alt='' />
            <p className='hidden md:block'>Dashboard</p>
          </NavLink>

          <NavLink to='/all-appointments' className={linkClass}>
            <img className='min-w-5 transition-transform duration-300 hover:scale-110' src={assets.appointment_icon} alt='' />
            <p className='hidden md:block'>Appointments</p>
          </NavLink>

          <NavLink to='/all-users' className={linkClass}>
            <img className='min-w-5 transition-transform duration-300 hover:scale-110' src={assets.people_icon} alt='' />
            <p className='hidden md:block'>All Users</p>
          </NavLink>

          <NavLink to='/add-doctor' className={linkClass}>
            <img className='min-w-5 transition-transform duration-300 hover:scale-110' src={assets.add_icon} alt='' />
            <p className='hidden md:block'>Add Doctor</p>
          </NavLink>

          <NavLink to='/doctor-list' className={linkClass}>
            <img className='min-w-5 transition-transform duration-300 hover:scale-110' src={assets.people_icon} alt='' />
            <p className='hidden md:block'>Doctors List</p>
          </NavLink>

        </ul>
      )}

      {dToken && (
        <ul className='text-[#515151] mt-5'>

          <NavLink to='/doctor-dashboard' className={linkClass}>
            <img className='min-w-5 transition-transform duration-300 hover:scale-110' src={assets.home_icon} alt='' />
            <p className='hidden md:block'>Dashboard</p>
          </NavLink>

          <NavLink to='/doctor-appointments' className={linkClass}>
            <img className='min-w-5 transition-transform duration-300 hover:scale-110' src={assets.appointment_icon} alt='' />
            <p className='hidden md:block'>Appointments</p>
          </NavLink>

          <NavLink to='/doctor-profile' className={linkClass}>
            <img className='min-w-5 transition-transform duration-300 hover:scale-110' src={assets.people_icon} alt='' />
            <p className='hidden md:block'>Profile</p>
          </NavLink>

        </ul>
      )}

    </div>
  )
}

export default Sidebar


/* 

"Sidebar uses conditional rendering based on context tokens to show role-specific menus. The implementation is simple and works for a 2-role system, but has architectural weakness: separate contexts create dual-token race condition risk. For production, consolidate to single AuthContext with computed role state, and add accessibility labels. The responsive design is solid, but missing loading states and nested route support."

*/