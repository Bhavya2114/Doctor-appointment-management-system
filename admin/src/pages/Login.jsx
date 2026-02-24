import axios from 'axios'
import React, { useContext, useState } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
const Login = () => {

  const [state, setState] = useState('Admin')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const { setDToken } = useContext(DoctorContext)
  const { setAToken } = useContext(AdminContext)

  const navigate = useNavigate()   // ✅ added

  const onSubmitHandler = async (event) => {
    setLoading(true)
    event.preventDefault();

    if (state === 'Admin') {

      const { data } = await axios.post(
        backendUrl + '/api/admin/login',
        { email, password }
      )

      if (data.success) {
        setAToken(data.token)
        localStorage.setItem('aToken', data.token)

        // ✅ Redirect to Admin Dashboard
        navigate('/dashboard')

      } else {
        toast.error(data.message)
      }

    } else {

      const { data } = await axios.post(
        backendUrl + '/api/doctor/login',
        { email, password }
      )

      if (data.success) {
        setDToken(data.token)
        localStorage.setItem('dToken', data.token)

        // ✅ Redirect to Doctor Dashboard
        navigate('/doctor-dashboard')

      } else {
        toast.error(data.message)
      }

    }
    setLoading(false)
  }

  return (
    <form onSubmit={onSubmitHandler} className="min-h-screen flex">

      {/* LEFT PANEL */}
      <div className="hidden md:flex w-1/2 gradient-main text-white flex-col justify-center px-20 relative">

        <div className="absolute inset-0 bg-black/10"></div>

        <div className="relative z-10">
          <h1 className="text-6xl font-semibold mb-8 leading-tight">
            Admin & Doctor Panel
          </h1>

          <ul className="space-y-4 text-white/90 text-lg">
            <li>✔ Manage doctors easily</li>
            <li>✔ Track appointments live</li>
            <li>✔ Secure dashboard access</li>
          </ul>
        </div>

      </div>

      {/* RIGHT PANEL */}
      {/* RIGHT PANEL */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 px-6 sm:px-16">

        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl">

          {/* LOGO */}
          <div className="flex items-center gap-2 mb-6 justify-center">
            <img src={assets.logo} className="w-9" />
            <p className="text-2xl font-semibold text-primary">Medlink</p>
          </div>

          <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
            {state} Login
          </h1>

          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Email"
            className="input-box"
            type="email"
            required
          />

          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Password"
            className="input-box mb-5"
            type="password"
            required
          />

          <button
            disabled={loading}
            className="w-full py-3 rounded-lg text-white btn-primary font-semibold hover:scale-105 transition"
          >
            {loading ? "Please wait..." : "LOGIN"}
          </button>

          <p
            onClick={() => setState(state === "Admin" ? "Doctor" : "Admin")}
            className="text-primary mt-4 cursor-pointer text-sm text-center hover:underline"
          >
            {state === "Admin" ? "Login as Doctor" : "Login as Admin"}
          </p>

        </div>
      </div>

    </form>
  )
}

export default Login