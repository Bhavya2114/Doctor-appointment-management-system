import React, { useContext, useMemo, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useRef } from "react";
const Doctors = () => {

  const { speciality } = useParams()
  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)

  const [showFilter, setShowFilter] = useState(false)
  const [search, setSearch] = useState("")
  const [show, setShow] = useState(false);
const ref = useRef();

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => setShow(entry.isIntersecting),
    { threshold: 0.15 }
  );

  if (ref.current) observer.observe(ref.current);

  return () => observer.disconnect();
}, []);

  const specialities = [
    "General physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatricians",
    "Neurologist",
    "Gastroenterologist"
  ]

  //  Derived filtering (no extra state)
const filteredDoctors = useMemo(() => {
  let result = doctors

  if (speciality) {
    result = result.filter(doc => doc.speciality === speciality)
  }

  if (search.trim()) {
    result = result.filter(doc =>
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.speciality.toLowerCase().includes(search.toLowerCase())
    )
  }

  return result
}, [doctors, speciality, search])

  return (
  <div
    ref={ref}
    className={`reveal ${show ? "active" : ""}`}
  >

      <p className='text-gray-600'>
        Browse through the doctors specialist.
      </p>
              {/* SEARCH BAR */}
<div className="w-full flex justify-center mt-5 mb-6">
  <input
    type="text"
    placeholder="Search doctors or speciality..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full sm:w-[70%] lg:w-[55%] px-6 py-3 rounded-full border border-gray-300 outline-none focus:ring-2 focus:ring-primary/40 transition"
  />
</div>
<p className="text-sm text-gray-500 mb-4 text-center sm:text-left">
  Showing <span className="font-semibold text-primary">{filteredDoctors.length}</span> doctors
</p>

      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setShowFilter(prev => !prev)}
          className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${
            showFilter ? 'bg-primary text-white' : ''
          }`}
        >
          Filters
        </button>

        {/* Sidebar Filters */}
  <div
  className={`flex-col gap-4 text-sm text-gray-600 sm:sticky sm:top-24 self-start ${
    showFilter ? 'flex' : 'hidden sm:flex'
  }`}
>
          {specialities.map((item) => (
            <p
              key={item}
              onClick={() =>
                speciality === item
                  ? navigate('/doctors')
                  : navigate(`/doctors/${item}`)
              }
              className={`w-full sm:w-auto px-4 py-2 rounded-full border text-center transition-all cursor-pointer
${
  speciality === item
    ? 'bg-primary text-white shadow-md scale-105'
    : 'hover:bg-primary/10 hover:scale-105'
}`}
            >
              {item}
            </p>
          ))}
        </div>


        {/* Doctors Grid */}
        <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 hover:shadow-xl hover:shadow-primary/20'>
          {filteredDoctors.length === 0 && (
  <div className="col-span-full text-center py-16 text-gray-400">
    <p className="text-xl font-medium">No doctors found</p>
    <p className="text-sm mt-2">Try changing search or filter</p>
  </div>
)}
          {filteredDoctors.map((item) => {

            const isAvailable = item.available !== false

            return (
              <div
                key={item._id}
                onClick={() => {
                  if (isAvailable) {
                    navigate(`/appointment/${item._id}`)
                    window.scrollTo(0, 0)
                  }
                }}
                className={`rounded-2xl overflow-hidden transition-all duration-300 group bg-white
                  ${
                    isAvailable
                      ? 'border-primary/30 cursor-pointer hover:-translate-y-2.5'
                      : 'border-gray-300 opacity-60 cursor-not-allowed'
                  }`}
              >

  <div className="w-full h-48 bg-primary/10 flex items-center justify-center overflow-hidden">
  <img
    className="h-full object-contain transition duration-500 group-hover:scale-110"
    src={item.image}
    alt={item.name}
  />
</div>
                <div className='p-4'>
                  <div
                    className={`flex items-center gap-2 text-sm ${
                      isAvailable ? 'text-green-500' : 'text-gray-500'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAvailable ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    ></span>
                    <span>
                      {isAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>

                  <p className='text-neutral-800 text-lg font-medium'>
                    {item.name}
                  </p>

                  <p className='text-zinc-600 text-sm'>
                    {item.speciality}
                  </p>
                </div>

              </div>
            )
          })}

        </div>

      </div>

    </div>
  )
}

export default Doctors
