import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Navbar = () => {

  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const { token, setToken, userData } = useContext(AppContext)

  const logout = () => {
    localStorage.removeItem('token')
    setToken(false)
    navigate('/login')
  }

  return (
  <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-[#ADADAD] sticky top-0 z-50 backdrop-blur-md bg-white/80'>

      {/* Logo */}
   <div
  onClick={() => navigate('/')}
  className="flex items-center gap-2 cursor-pointer"
>
  <img src={assets.logo} className="w-10 sm:w-11" alt="icon" />

  <h1 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight">
    Medlink
  </h1>
</div>

      {/* Desktop Menu */}
      <ul className='hidden md:flex items-center gap-6 font-medium'>

        {[
          { path: '/', label: 'HOME' },
          { path: '/doctors', label: 'ALL DOCTORS' },
          { path: '/about', label: 'ABOUT' },
          { path: '/contact', label: 'CONTACT' }
        ].map((item) => (
          <li key={item.path}>
 <NavLink
  to={item.path}
  className={({ isActive }) =>
    `py-1 inline-block cursor-pointer transition-all duration-300 hover:scale-110 ${
      isActive ? 'text-primary' : 'text-black hover:text-[#256c96]'
    }`
  }
>
              {item.label}
            </NavLink>
          </li>
        ))}

      </ul>

      {/* Right Section */}
      <div className='flex items-center gap-4'>

        {token && userData ? (
          <div className='relative group cursor-pointer'>

            <div className='flex items-center gap-2'>
            <img
  className='w-8 h-8 rounded-full object-cover'
  src={userData?.image || assets.profile_pic}
  alt="User"
  onError={(e) => (e.target.src = assets.profile_pic)}
/>
              <img
                className='w-2.5'
                src={assets.dropdown_icon}
                alt="Dropdown"
              />
            </div>

            {/* Dropdown */}
           <div className='absolute right-0 mt-2 w-48 h-50 py-2 backdrop-blur-md bg-white/90 rounded-2xl shadow-xl border border-gray-100 text-sm text-gray-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200'>
              <div className='flex flex-col p-4 gap-2'>
                <p
                  onClick={() => navigate('/my-profile')}
                  className='px-3 py-2.5 rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer transition'
                >
                  My Profile
                </p>
                <p
                  onClick={() => navigate('/my-appointments')}
                 className='px-3 py-2.5 rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer transition'
                >
                  My Appointments
                </p>
                
                <p
                  onClick={logout}
                  className='px-3 py-2.5 rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer transition'
                >
                  Logout
                </p>
              </div>
            </div>

          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
      className="px-8 py-3 rounded-full font-light hidden md:block btn-global"
          >
             Login
          </button>
        )}

        {/* Mobile Menu Icon */}
        <img
          onClick={() => setShowMenu(true)}
          className='w-6 md:hidden cursor-pointer'
          src={assets.menu_icon}
          alt="Menu"
        />

      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-white z-50 transform ${
          showMenu ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300`}
      >

        <div className='flex items-center justify-between px-5 py-6'>
          <img src={assets.logo} className='w-36' alt="Logo" />
          <img
            onClick={() => setShowMenu(false)}
            src={assets.cross_icon}
            className='w-7 cursor-pointer'
            alt="Close"
          />
        </div>

        <ul className='flex flex-col items-center gap-6 mt-10 text-lg font-medium'>
          {[
            { path: '/', label: 'HOME' },
            { path: '/doctors', label: 'ALL DOCTORS' },
            { path: '/about', label: 'ABOUT' },
            { path: '/contact', label: 'CONTACT' }
          ].map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={() => setShowMenu(false)}
                className='hover:text-primary transition'
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

      </div>

    </div>
  )
}

export default Navbar
