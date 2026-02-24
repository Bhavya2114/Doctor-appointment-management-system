import React from 'react'
import { assets } from '../assets/assets'
import { useEffect, useRef, useState } from "react";
const About = () => {
  const [show, setShow] = useState(false);
const ref = useRef();

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => setShow(entry.isIntersecting),
    { threshold: 0.2 }
  );

  if (ref.current) observer.observe(ref.current);

  return () => observer.disconnect();
}, []);
  return (
  <div
  ref={ref}
  className={`max-w-7xl mx-auto px-6 md:px-10 reveal ${show ? "active" : ""}`}
>

      {/* ----- Heading ----- */}
     <div className="text-center pt-14">
  <p className="text-3xl font-semibold">
    ABOUT <span className="gradient-text">US</span>
  </p>
</div>

      {/* ----- About Section ----- */}
      <div className='my-12 flex flex-col md:flex-row items-center gap-12'>
        
        <img
  className="w-full md:max-w-[380px] rounded-2xl shadow-lg hover:scale-105 transition duration-500"
  src={assets.about_image}
  alt="About Medlink"
/>

        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600 leading-relaxed'>
          
          <p>
            Welcome to <b>Medlink</b>, your trusted partner in managing your healthcare needs
            conveniently and efficiently. At Medlink, we understand the challenges
            individuals face when it comes to scheduling doctor appointments and
            managing their health records.
          </p>

          <p>
            Medlink is committed to excellence in healthcare technology. We
            continuously strive to enhance our platform, integrating the latest
            advancements to improve user experience and deliver superior service.
            Whether you're booking your first appointment or managing ongoing care,
            Medlink is here to support you every step of the way.
          </p>

          <div>
            <h3 className='text-gray-800 font-semibold text-base mb-2'>
              Our Vision
            </h3>
            <p>
              Our vision at Medlink is to create a seamless healthcare experience
              for every user. We aim to bridge the gap between patients and
              healthcare providers, making it easier for you to access the care you
              need, when you need it.
            </p>
          </div>

        </div>
      </div>

      {/* ----- Why Choose Us ----- */}
      <div className='text-xl my-6'>
        <p>
          WHY <span className='text-gray-700 font-semibold'>CHOOSE US</span>
        </p>
      </div>

      <div className='flex flex-col md:flex-row gap-6 mb-20'>

        <div className="border border-primary/20 rounded-2xl px-8 md:px-12 py-8 flex flex-col gap-4 text-[15px] text-gray-600 bg-white hover:bg-gradient-to-br hover:from-primary hover:to-[#5F6FFF] hover:text-white hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer">
          <b>EFFICIENCY:</b>
          <p>Streamlined appointment scheduling that fits into your busy lifestyle.</p>
        </div>

        <div className="border border-primary/20 rounded-2xl px-8 md:px-12 py-8 flex flex-col gap-4 text-[15px] text-gray-600 bg-white hover:bg-gradient-to-br hover:from-primary hover:to-[#5F6FFF] hover:text-white hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer">
          <b>CONVENIENCE:</b>
          <p>Access to a network of trusted healthcare professionals in your area.</p>
        </div>

        <div className="border border-primary/20 rounded-2xl px-8 md:px-12 py-8 flex flex-col gap-4 text-[15px] text-gray-600 bg-white hover:bg-gradient-to-br hover:from-primary hover:to-[#5F6FFF] hover:text-white hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer">
          <b>PERSONALIZATION:</b>
          <p>Tailored recommendations and reminders to help you stay on top of your health.</p>
        </div>

      </div>

    </div>
  )
}

export default About
