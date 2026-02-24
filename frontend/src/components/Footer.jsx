import React from 'react'
import { assets } from '../assets/assets'
import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
const Footer = () => {
  const navigate = useNavigate()
  return (
    <footer className='md:mx-10 mt-40'>

      {/* Main Footer Section */}
      <div className='grid grid-cols-1 sm:grid-cols-[3fr_1fr_1fr] gap-8 my-10 text-sm'>

        {/* Prescripto Section */}
        <div>
          <div
           onClick={() => navigate('/')}
           className="flex items-center gap-2 cursor-pointer"
         >
           <img src={assets.logo} className="w-10 sm:w-11" alt="icon" />
         
           <h1 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight">
             Medlink
           </h1>
         </div>
         
          <p className='text-gray-600 leading-6 md:w-2/3'>
            Medlink is a smart healthcare appointment system designed 
            to connect patients with trusted doctors seamlessly and efficiently.
          </p>
        </div>

        {/* Company Section */}
        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>
              <NavLink to="/" className='hover:text-primary transition-colors'>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className='hover:text-primary transition-colors'>
                About Us
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className='hover:text-primary transition-colors'>
                Contact
              </NavLink>
            </li>
            <li className='hover:text-primary transition-colors cursor-pointer'>
              Privacy Policy
            </li>
          </ul>
        </div>

        {/* Get In Touch Section */}
        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>+1-212-456-7890</li>
            <li>support@medlink.com</li>
          </ul>
        </div>

      </div>

      {/* Bottom Line */}
      <div className='border-t border-gray-300 pt-5'>
        <p className='text-sm text-center text-gray-500'>
          © {new Date().getFullYear()} medlink.com — All Rights Reserved.
        </p>
      </div>

    </footer>
  )
}

export default Footer
