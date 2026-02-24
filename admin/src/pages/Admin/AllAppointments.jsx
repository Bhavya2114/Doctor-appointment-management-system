import React, { useEffect, useContext, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const AllAppointments = () => {
  const [show, setShow] = useState(false)

  const { aToken, appointments, getAllAppointments } = useContext(AdminContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken, getAllAppointments])

  useEffect(() => {
    if (appointments.length > 0) {
      setLoading(false)
    }
  }, [appointments])
  useEffect(() => {
    setShow(true)
  }, [])

  return (
    <div className={`w-full max-w-6xl m-5 transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>

      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-auto'>

        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {loading ? (
          <p className="p-6 text-gray-500">Loading appointments...</p>
        ) : (
          appointments.map((item, index) => (
            <div
              key={item._id}
              className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50'
            >

              <p className='max-sm:hidden'>{index + 1}</p>

              <div className='flex items-center gap-2'>
                <img
                  src={item?.userData?.image ? item.userData.image : assets.profile_pic}
                  onError={(e) => {
                    if (e.target.src !== assets.profile_pic) {
                      e.target.src = assets.profile_pic
                    }
                  }}
                  className='w-8 h-8 rounded-full object-cover'
                  alt=""
                />
                <p>{item?.userData?.name}</p>
              </div>

              <p className='max-sm:hidden'>
                {calculateAge(item?.userData?.dob)}
              </p>

              <p>
                {slotDateFormat(item?.slotDate)}, {item?.slotTime}
              </p>

              <div className='flex items-center gap-2'>
                <img
                  src={item?.docData?.image}
                  className='w-8 h-8 rounded-full bg-gray-200 object-cover'
                  alt=""
                />
                <p>{item?.docData?.name}</p>
              </div>

              <p>{currency}{item?.amount}</p>

              {item?.cancelled ? (
                <p className='text-red-400 text-xs font-medium'>
                  {item?.cancelledBy === 'doctor' ? 'Cancelled by Doctor' : 'Cancelled by Patient'}
                </p>
              ) : item?.isCompleted ? (
                <p className='text-green-500 text-xs font-medium'>Completed</p>
              ) : (
                <p className='text-blue-500 text-xs font-medium'>Scheduled</p>
              )}

            </div>
          ))
        )}

      </div>
    </div>
  )
}

export default AllAppointments
