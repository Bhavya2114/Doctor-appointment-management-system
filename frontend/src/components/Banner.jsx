import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from "react";

const Banner = () => {
    const [visible, setVisible] = useState(false);
const ref = useRef();
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      setVisible(entry.isIntersecting);
    },
    { threshold: 0.2 }
  );

  if (ref.current) observer.observe(ref.current);

  return () => observer.disconnect();
}, []);

    const navigate = useNavigate()

    return (
    <div
  ref={ref}
  className={`flex gradient-main rounded-lg px-6 sm:px-10 md:px-14 lg:px-12 my-20 md:mx-10 reveal ${visible ? "active" : ""}`}
>

            {/* ------- Left Side ------- */}
            <div className='flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5'>

                <div className='text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-white leading-tight'>
                    <p>Book Appointment</p>
                    <p className='mt-4'>With 100+ Trusted Doctors</p>
                </div>

                

            </div>

            {/* ------- Right Side ------- */}
            <div className='hidden md:flex md:w-1/2 lg:w-[370px] relative items-end'>

                <img
                    className='w-full max-w-md'
                    src={assets.appointment_img}
                    alt="Appointment"
                />

            </div>

        </div>
    )
}

export default Banner
