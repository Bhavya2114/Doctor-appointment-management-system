import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorAppointments = () => {

  const {
    dToken,
    appointments,
    getAppointments,
    cancelAppointment,
    completeAppointment
  } = useContext(DoctorContext)

  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)

  // Loading State
  const [loading, setLoading] = useState(true)

  // Confirmation Modal State
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmType, setConfirmType] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  const openConfirm = (type, id) => {
    setConfirmType(type)
    setSelectedId(id)
    setConfirmOpen(true)
  }

  useEffect(() => {
    const fetchData = async () => {
      if (dToken) {
        setLoading(true)
        await getAppointments()
        setLoading(false)
      }
    }
    fetchData()
  }, [dToken]) // removed getAppointments to avoid infinite loop

  return (
    <div className='w-full max-w-6xl m-5'>

      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-auto'>

        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {/* ✅ Loading Skeleton */}
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[0.5fr_2fr_1fr_3fr_1fr_1fr] gap-4 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <p className="p-6 text-gray-500">No appointments found.</p>
        ) : (
          appointments.map((item, index) => (
            <div
              key={item._id}
              className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50'
            >

              <p className='max-sm:hidden'>{index + 1}</p>

              <div className='flex items-center gap-2'>
                <img
                  src={item?.userData?.image || assets.profile_pic}
                  onError={(e) => (e.target.src = assets.profile_pic)}
                  className='w-8 h-8 rounded-full object-cover'
                  alt=""
                />
                <p>{item?.userData?.name}</p>
              </div>

              <p className='max-sm:hidden'>
                {item?.userData?.dob ? calculateAge(item?.userData?.dob) : '-'}
              </p>

              <p>
                {slotDateFormat(item?.slotDate)}, {item?.slotTime}
              </p>

              <p>{currency}{item?.amount}</p>

              {item?.cancelled ? (
                <p className='text-red-500 text-xs font-medium'>
                  {item?.cancelledBy === "user" && "Cancelled by Patient"}
                  {item?.cancelledBy === "doctor" && "Cancelled by You"}
                  {item?.cancelledBy === null && "Cancelled"}
                </p>
              ) : item?.isCompleted ? (
                <p className='text-green-500 text-xs font-medium'>Completed</p>
              ) : (
                <div className='flex gap-2'>
                  <img
                    onClick={() => openConfirm("cancel", item._id)}
                    className='w-8 cursor-pointer hover:opacity-70 transition'
                    src={assets.cancel_icon}
                    alt=""
                  />
                  <img
                    onClick={() => openConfirm("complete", item._id)}
                    className='w-8 cursor-pointer hover:opacity-70 transition'
                    src={assets.tick_icon}
                    alt=""
                  />
                </div>
              )}

            </div>
          ))
        )}

      </div>

      {/* ✅ Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-xl w-[400px] p-6 text-center">

            <h2 className="text-lg font-semibold mb-4">
              {confirmType === "cancel"
                ? "Are you sure you want to cancel this appointment?"
                : "Are you sure you want to complete this appointment?"}
            </h2>

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => {
                  if (confirmType === "cancel") {
                    cancelAppointment(selectedId)
                  } else {
                    completeAppointment(selectedId)
                  }
                  setConfirmOpen(false)
                }}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Yes
              </button>

              <button
                onClick={() => setConfirmOpen(false)}
                className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default DoctorAppointments