import React, { useContext, useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyAppointments = () => {

  const { backendUrl, token, appointmentUpdateSignal } = useContext(AppContext)
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // FIX 3: Helper function to calculate minutes until appointment
  const calculateMinutesUntilAppointment = (slotDate, slotTime) => {
    try {
      // Parse slotDate format: "DD_MM_YYYY"
      const [day, month, year] = slotDate.split('_').map(Number)
      // Parse slotTime format: "HH:MM"
      const [hour, minute] = slotTime.split(':').map(Number)
      // Create appointment datetime (month is 0-indexed in JS)
      const appointmentTime = new Date(year, month - 1, day, hour, minute).getTime()
      const currentTime = Date.now()
      // Calculate minutes difference
      const minutesDifference = Math.floor((appointmentTime - currentTime) / (1000 * 60))
      return minutesDifference
    } catch (error) {
      console.error('Error calculating appointment time:', error)
      return -1 // Return -1 on error to hide button
    }
  }

  const formatDate = (slotDate) => {
    if (!slotDate) return ""
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  // ========================
  // FETCH APPOINTMENTS
  // ========================
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/appointments`,
        { headers: { token } }
      )

      if (data.success) {
        setAppointments([...data.appointments].reverse())
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // ========================
  // CANCEL APPOINTMENT
  // ========================
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // ========================
  // HANDLE PAYMENT
  // ========================
  const handlePayment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/payment/create-order`,
        { appointmentId },
        { headers: { token } }
      )

      if (data.success) {

        if (!window.Cashfree) {
          toast.error("Payment SDK not loaded")
          return
        }

        const cashfree = window.Cashfree({
          mode: "sandbox"
        })

        cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          redirectTarget: "_self"
        })

      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    } else {
      navigate('/login')
    }
  }, [token, navigate, appointmentUpdateSignal])
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

  return (
    <div
      ref={ref}
      className={`max-w-4xl mx-auto px-4 reveal ${show ? "active" : ""}`}
    >

      <p className='pb-4 mt-12 font-semibold text-xl text-gray-800 border-b border-gray-200'>
        My Appointments
      </p>

      {appointments.length === 0 && (
        <p className='text-gray-500 mt-6'>No appointments found.</p>
      )}

      {appointments.map((item) => {

        const isCancelled = item.cancelled
        const isCompleted = item.isCompleted

        return (
          <div
            key={item._id}
            className='flex flex-col sm:flex-row gap-6 py-6 border-b border-gray-200'
          >

            {/* Doctor Image */}
            <div className="overflow-hidden rounded-xl w-32 h-32 bg-primary/10">
              <img
                className="w-full h-full object-cover transition duration-500 hover:scale-110"
                src={item.docData.image}
                alt={item.docData.name}
              />
            </div>

            {/* Doctor Details */}
            <div className='flex-1 text-sm text-gray-600'>

              <p className='text-lg font-semibold text-gray-800'>
                {item.docData.name}
              </p>

              <p className='mt-1'>{item.docData.speciality}</p>

              <p className='font-medium mt-3 text-gray-700'>Address:</p>
              <p>{item.docData.address?.line1}</p>
              <p>{item.docData.address?.line2}</p>

              <p className='mt-3'>
                <span className='font-medium text-gray-700'>
                  Date & Time:
                </span>{' '}
                {formatDate(item.slotDate)} | {item.slotTime}
              </p>

              {/* Payment Status */}
              <p className='mt-2'>
                <span className='font-medium text-gray-700'>
                  Payment Status:
                </span>{' '}
                {item.paymentStatus === "PAID" && (
                  <span className='text-green-600 font-semibold'>Paid</span>
                )}
                {item.paymentStatus === "PENDING" && (
                  <span className='text-yellow-600 font-semibold'>Pending</span>
                )}
                {item.paymentStatus === "FAILED" && (
                  <span className='text-red-600 font-semibold'>Failed</span>
                )}
              </p>

            </div>

            {/* Action Buttons */}
            <div className='flex flex-col gap-3 justify-end sm:items-end text-sm'>

              {/* FIX: Show Pay Now and Cancel together for PENDING appointments */}
              {item.paymentStatus === "PENDING" && !isCancelled && (
                // FIX: Adjust button stacking order - stack vertically
                <div className='flex flex-col gap-2'>
                  <button
                    onClick={() => handlePayment(item._id)}
                    className='sm:min-w-40 py-2.5 px-4 rounded-lg btn-global'
                  >
                    Pay Now
                  </button>
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className='sm:min-w-40 py-2.5 px-4 border border-red-500 rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition hover:scale-105'
                  >
                    Cancel Appointment
                  </button>
                </div>
              )}

              {isCompleted && (
                <button className='sm:min-w-40 py-2 border border-green-500 rounded text-green-500'>
                  Completed
                </button>
              )}

              {/* FIX: Show cancel button for PAID appointments with 1-hour window validation */}
              {!isCancelled && !isCompleted && item.paymentStatus === "PAID" && calculateMinutesUntilAppointment(item.slotDate, item.slotTime) >= 60 && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className='sm:min-w-40 py-2 bg-red-600 text-white rounded-lg 
             hover:bg-red-700 hover:scale-105 
             active:scale-95 
             transition-all duration-200 
             cursor-pointer 
             shadow-md hover:shadow-lg'
                >
                  Cancel Appointment
                </button>
              )}

              {/* FIX: Show cancellation message based on who cancelled */}
              {isCancelled && (
                <button className='sm:min-w-40 py-2 border border-red-500 rounded text-red-500'>
                  {item.cancelledBy === "user" && "Appointment Cancelled by You"}
                  {item.cancelledBy === "doctor" && "Appointment Cancelled by Doctor"}
                  {item.cancelledBy === null && "Appointment Cancelled"}
                </button>
              )}

            </div>

          </div>
        )
      })}

    </div>
  )
}

export default MyAppointments