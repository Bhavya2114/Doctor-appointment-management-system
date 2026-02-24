import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {

  const { dToken, setDToken } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)

  const navigate = useNavigate()

  const logout = () => {
    if (dToken) {
      setDToken('')
      localStorage.removeItem('dToken')
    }

    if (aToken) {
      setAToken('')
      localStorage.removeItem('aToken')
    }

    navigate('/')
  }

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>

      <div
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 cursor-pointer hover:scale-105 transition"
      >
        <img src={assets.logo} className="w-10 sm:w-11" alt="icon" />

        <h1 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight">
          Medlink
        </h1>
      </div>

      <button
        onClick={logout}
        className="px-10 py-3 rounded-lg text-white btn-primary font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300">
        Logout
      </button>

    </div>
  )
}

export default Navbar
