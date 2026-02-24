import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const Dashboard = () => {
  const [show, setShow] = useState(false)

  const { aToken, getDashData, dashData } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)

  useEffect(() => {
    if (aToken) {
      getDashData()
    }
  }, [aToken, getDashData])
  useEffect(() => {
  setShow(true)
}, [])

  if (!dashData) return null

  return (
    <div className={`m-5 transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>

      {/* Summary Cards */}
      <div className='flex flex-wrap gap-3'>
        <StatCard icon={assets.doctor_icon} value={dashData?.doctors} label="Doctors" />
        <StatCard icon={assets.appointments_icon} value={dashData?.appointments} label="Appointments" />
        <StatCard icon={assets.patients_icon} value={dashData?.patients} label="Patients" />
      </div>

      {/* Latest Bookings */}
      <div className='bg-white mt-10 rounded border'>
        <div className='flex items-center gap-2.5 px-4 py-4 border-b'>
          <img src={assets.list_icon} alt="" />
          <p className='font-semibold'>Latest Bookings</p>
        </div>

        <div>
          {dashData?.latestAppointments?.slice(0, 5).map((item) => (
            <div
              key={item._id}
              className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100'
            >

              <img
                className='rounded-full w-10 h-10 object-cover'
                src={item?.docData?.image}
                alt=""
              />

              <div className='flex-1 text-sm'>
                <p className='text-gray-800 font-medium'>
                  {item?.docData?.name}
                </p>
                <p className='text-gray-600'>
                  Booking on {slotDateFormat(item?.slotDate)}
                </p>
              </div>

              {item?.cancelled ? (
                <div>
                  <p className='text-red-400 text-xs font-medium'>
                    {item?.cancelledBy === 'doctor' ? 'Cancelled by Doctor' : 'Cancelled by Patient'}
                  </p>
                  {item?.cancelReason ? (
                    <p className='text-gray-400 text-xs'>{item.cancelReason}</p>
                  ) : null}
                </div>
              ) : item?.isCompleted ? (
                <p className='text-green-500 text-xs font-medium'>Completed</p>
              ) : (
                <p className='text-blue-500 text-xs font-medium'>Scheduled</p>
              )}

            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

const StatCard = ({ icon, value, label }) => (
  <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border border-gray-100 cursor-pointer hover:scale-105 transition-all'>
    <img className='w-14' src={icon} alt="" />
    <div>
      <p className='text-xl font-semibold text-gray-600'>{value}</p>
      <p className='text-gray-400'>{label}</p>
    </div>
  </div>
)

export default Dashboard
