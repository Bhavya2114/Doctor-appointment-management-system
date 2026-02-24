import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'


const DoctorDashboard = () => {

  const {
    dToken,
    dashData,
    getDashData,
    cancelAppointment,
    completeAppointment
  } = useContext(DoctorContext)

  const { slotDateFormat, currency } = useContext(AppContext)

  // FIX: Add modal state management
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmType, setConfirmType] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  const openConfirm = (type, id) => {
    setConfirmType(type)
    setSelectedId(id)
    setConfirmOpen(true)
  }

  useEffect(() => {
    if (dToken) {
      getDashData()
    }
  }, [dToken, getDashData])

  if (!dashData) return null

  return (
    <div className='m-5'>

      {/* Summary Cards */}
      <div className='flex flex-wrap gap-3'>
        <StatCard
          icon={assets.earning_icon}
          value={`${currency} ${dashData?.earnings}`}
          label="Earnings"
        />
        <StatCard
          icon={assets.appointments_icon}
          value={dashData?.appointments}
          label="Appointments"
        />
        <StatCard
          icon={assets.patients_icon}
          value={dashData?.patients}
          label="Patients"
        />
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
                src={item?.userData?.image ? item.userData.image : assets.profile_pic}
                onError={(e) => {
                  if (e.target.src !== assets.profile_pic) {
                    e.target.src = assets.profile_pic
                  }
                }}
                alt=""
              />

              <div className='flex-1 text-sm'>
                <p className='text-gray-800 font-medium'>
                  {item?.userData?.name}
                </p>
                <p className='text-gray-600'>
                  Booking on {slotDateFormat(item?.slotDate)}
                </p>
              </div>

              {item?.cancelled ? (
                <p className='text-red-400 text-xs font-medium'>Cancelled</p>
              ) : item?.isCompleted ? (
                <p className='text-green-500 text-xs font-medium'>Completed</p>
              ) : (
                <div className='flex gap-2'>
                  <img
                    // FIX: Replace toast confirmation with modal
                    onClick={() => openConfirm("cancel", item._id)}
                    className='w-8 cursor-pointer hover:opacity-70 transition'
                    src={assets.cancel_icon}
                    alt=""
                  />
                  <img
                    // FIX: Replace toast confirmation with modal
                    onClick={() => openConfirm("complete", item._id)}
                    className='w-8 cursor-pointer hover:opacity-70 transition'
                    src={assets.tick_icon}
                    alt=""
                  />
                </div>
              )}

            </div>
          ))}
        </div>
      </div>

      {/* FIX: Centered confirmation modal */}
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

const StatCard = ({ icon, value, label }) => (
  <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border border-gray-100 cursor-pointer hover:scale-105 transition-all'>
    <img className='w-14' src={icon} alt="" />
    <div>
      <p className='text-xl font-semibold text-gray-600'>{value}</p>
      <p className='text-gray-400'>{label}</p>
    </div>
  </div>
)

export default DoctorDashboard