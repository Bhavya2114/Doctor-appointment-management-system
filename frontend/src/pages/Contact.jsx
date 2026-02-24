import React from 'react'
import { assets } from '../assets/assets'
import { useEffect, useState,useRef } from 'react'

const Contact = () => {
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
  className={`max-w-6xl mx-auto px-6 md:px-10 reveal ${show ? "active" : ""}`}
>
      {/* Heading */}
    <div className='text-center text-3xl pt-14 text-gray-700'>
        <p>
         CONTACT <span className='text-primary font-semibold'>US</span>
        </p>
      </div>

      {/* Contact Section */}
    <div className='my-14 flex flex-col md:flex-row items-center gap-12 mb-28 text-sm'>
        <img
           className='w-full md:max-w-[420px] rounded-2xl shadow-md hover:scale-105 transition-all duration-500'
          src={assets.contact_image}
          alt='Contact Medlink'
        />
      

       <div
  className={`flex flex-col justify-center items-start gap-5 md:max-w-md ${
  show ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
}`}
>

          <p className='font-semibold text-lg text-primary'>
            OUR OFFICE
          </p>

          <p className='text-gray-500 leading-relaxed'>
            54709 Willms Station <br />
            Suite 350, Washington, USA
          </p>

          <p className='text-gray-500 leading-relaxed'>
            Tel: (415) 555-0132 <br />
            Email: support@medlink.com
          </p>

          <p className='font-semibold text-lg text-primary'>
            CAREERS AT MEDLINK
          </p>

          <p className='text-gray-500'>
            Learn more about our teams and job openings.
          </p>

          <button className='btn-global px-8 py-3 rounded-full'>
            Explore Jobs
          </button>

        </div>

      </div>

    </div>
  )
}

export default Contact
