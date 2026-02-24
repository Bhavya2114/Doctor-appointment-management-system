import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import axios from 'axios'
import { toast } from 'react-toastify'

const Appointment = () => {

    const { docId } = useParams()
    const navigate = useNavigate()

    const {
        doctors,
        currencySymbol,
        backendUrl,
        token,
        getDoctorsData
    } = useContext(AppContext)

    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    const [docInfo, setDocInfo] = useState(null)
    const [docSlots, setDocSlots] = useState([])
    // FIX: Changed from 0 to null - no auto-selection of first day
    const [slotIndex, setSlotIndex] = useState(null)
    const [slotTime, setSlotTime] = useState('')
    const [loading, setLoading] = useState(false)
    // ✅ Track which dates are blocked (Rule 1 & 2)
    const [blockedDates, setBlockedDates] = useState({})

    // Fetch doctor info
    const fetchDocInfo = () => {
        const doctor = doctors.find((doc) => doc._id === docId)
        setDocInfo(doctor)
    }

    // ✅ Generate available slots dynamically
    const getAvailableSlots = () => {

        if (!docInfo) return

        // If doctor disabled availability
        if (!docInfo.available) {
            setDocSlots([])
            return
        }

        let today = new Date()
        let allSlots = []

        // Get working hours from DB
        const startTimeStr = docInfo?.workingHours?.startTime || "10:00"
        const endTimeStr = docInfo?.workingHours?.endTime || "16:40"

        const [startHour, startMin] = startTimeStr.split(":")
        const [endHour, endMin] = endTimeStr.split(":")

        for (let i = 0; i < 7; i++) {

            let currentDate = new Date(today)
            currentDate.setDate(today.getDate() + i)

            let endTime = new Date(currentDate)
            endTime.setHours(parseInt(endHour), parseInt(endMin), 0, 0)

            // Set doctor working start time
            let workingStart = new Date(currentDate)
            workingStart.setHours(parseInt(startHour), parseInt(startMin), 0, 0)

            if (i === 0) {

                let now = new Date()

                // ✅ Add 1 hour buffer
                now.setHours(now.getHours() + 1)

                // ✅ Round UP to next 30-min slot
                let minutes = now.getMinutes()
                let remainder = minutes % 30
                let minutesToAdd = remainder === 0 ? 0 : 30 - remainder

                now.setMinutes(minutes + minutesToAdd)
                now.setSeconds(0)
                now.setMilliseconds(0)

                // ✅ Do not allow slot before working hours
                currentDate = now > workingStart ? new Date(now) : new Date(workingStart)

            } else {

                currentDate = new Date(workingStart)
            }

            let timeSlots = []

            while (currentDate < endTime) {

                let formattedTime = currentDate.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })

                let day = currentDate.getDate()
                let month = currentDate.getMonth() + 1
                let year = currentDate.getFullYear()

                const slotDate = `${day}_${month}_${year}`

                const isBooked =
                    docInfo?.slots_booked?.[slotDate]?.includes(formattedTime)

                if (!isBooked) {
                    timeSlots.push({
                        datetime: new Date(currentDate),
                        time: formattedTime
                    })
                }

                currentDate.setMinutes(currentDate.getMinutes() + 30)
            }

            allSlots.push(timeSlots)
        }

        setDocSlots(allSlots)
    }

    // ✅ Check which dates are blocked (Rule 1 & 2)
    const checkBlockedDates = async () => {
        if (!docSlots.length || !token) return

        const blocked = {}

        for (let i = 0; i < docSlots.length; i++) {
            if (docSlots[i].length === 0) continue

            const firstSlot = docSlots[i][0]
            const date = firstSlot.datetime
            let day = date.getDate()
            let month = date.getMonth() + 1
            let year = date.getFullYear()
            const slotDate = `${day}_${month}_${year}`

            try {
                const { data } = await axios.get(
                    `${backendUrl}/api/user/check-day-availability`,
                    {
                        params: { docId, slotDate },
                        headers: { token }
                    }
                )

                if (data.success && data.isDayBlocked) {
                    blocked[slotDate] = true
                }
            } catch (error) {
                console.error(error)
            }
        }

        setBlockedDates(blocked)
    }

    // Book Appointment
    const bookAppointment = async () => {

        if (!token) {
            toast.warning('Login to book appointment')
            return navigate('/login')
        }

        const selectedSlot = docSlots[slotIndex]?.[0]

        if (!selectedSlot || !slotTime) {
            toast.error("Please select a valid date and time")
            return
        }

        setLoading(true)

        try {

            const date = selectedSlot.datetime

            let day = date.getDate()
            let month = date.getMonth() + 1
            let year = date.getFullYear()

            const slotDate = `${day}_${month}_${year}`

            const { data } = await axios.post(
                `${backendUrl}/api/user/book-appointment`,
                { docId, slotDate, slotTime },
                { headers: { token } }
            )

            if (data.success) {
                toast.success(data.message)
                // FIX: Reset slot selection and refresh doctor data
                setSlotIndex(null)
                setSlotTime('')
                getDoctorsData()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || error.message)
        }

        setLoading(false)
    }

    useEffect(() => {
        if (doctors.length > 0) {
            fetchDocInfo()
        }
    }, [doctors, docId])

    useEffect(() => {
        if (docInfo) {
            getAvailableSlots()
        }
    }, [docInfo])

    // FIX: Refresh doctor data on component mount and docId change
    // This ensures slots update after cancellations on other pages
    useEffect(() => {
        if (docId) {
            getDoctorsData()
        }
    }, [docId, getDoctorsData])

    // ✅ Check blocked dates when slots are generated
    useEffect(() => {
        if (docSlots.length > 0 && token && docId) {
            checkBlockedDates()
        }
    }, [docSlots, token, docId])

    return docInfo ? (
        <div>

            {/* Doctor Details */}
            <div className='flex flex-col sm:flex-row gap-4'>

                <div>
                    <img
                        className='bg-primary w-full sm:max-w-72 rounded-lg'
                        src={docInfo.image}
                        alt={docInfo.name}
                    />
                </div>

                <div className='flex-1 border border-gray-300 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>

                    <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
                        {docInfo.name}
                        <img className='w-5' src={assets.verified_icon} alt="Verified" />
                    </p>

                    <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
                        <p>{docInfo.degree} - {docInfo.speciality}</p>
                        <button className='py-0.5 px-2 border text-xs rounded-full'>
                            {docInfo.experience}
                        </button>
                    </div>

                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
                            About
                            <img className='w-3' src={assets.info_icon} alt="Info" />
                        </p>
                        <p className='text-sm text-gray-500 max-w-[700px] mt-1'>
                            {docInfo.about}
                        </p>
                    </div>

                    <p className='text-gray-500 font-medium mt-4'>
                        Appointment fee:
                        <span className='text-gray-600'>
                            {currencySymbol}{docInfo.fees}
                        </span>
                    </p>

                </div>
            </div>

            {/* Booking Section */}
            {docInfo.available ? (
                <div className='sm:ml-72 sm:pl-4 mt-6 font-medium text-gray-700'>

                    <p>Booking slots</p>

                    <div className='flex gap-3 items-center w-full overflow-x-auto mt-4'>
                        {docSlots.map((item, index) => {

                            const isFullyBooked = item.length === 0

                            // FIX: Don't render fully booked days - skip grey circle placeholders
                            if (isFullyBooked) {
                                return null
                            }

                            // ✅ Check if date is blocked (Rule 1 & 2)
                            const date = item[0].datetime
                            let day = date.getDate()
                            let month = date.getMonth() + 1
                            let year = date.getFullYear()
                            const slotDate = `${day}_${month}_${year}`
                            const isDayBlocked = blockedDates[slotDate]

                            return (
                                <div
                                    key={index}
                                    onClick={() => {
                                        if (!isDayBlocked) {
                                            setSlotIndex(index)
                                            setSlotTime('')
                                        }
                                    }}
                                    className={`text-center py-6 min-w-16 rounded-full transition-all duration-300
                                        ${isDayBlocked
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                            : slotIndex === index
                                                ? 'bg-primary text-white scale-105 shadow-md cursor-pointer'
                                                : 'border border-gray-200 hover:bg-primary hover:text-white hover:scale-105 hover:shadow-md cursor-pointer'
                                        }`}
                                >
                                    <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                                    <p>{item[0] && item[0].datetime.getDate()}</p>
                                </div>
                            )
                        })}
                    </div>

                    <div className='flex items-center gap-3 w-full overflow-x-auto mt-4'>
                        {slotIndex !== null && docSlots[slotIndex]?.length > 0 ? (
                            docSlots[slotIndex].map((item, index) => (
                                <p
                                    key={index}
                                    onClick={() => setSlotTime(item.time)}
                                    className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer transition-all duration-300
                                        ${item.time === slotTime
                                            ? 'bg-primary text-white scale-105 shadow-md'
                                            : 'text-gray-500 border border-gray-300 hover:bg-primary hover:text-white hover:scale-105 hover:shadow-md'
                                        }`}
                                >
                                    {item.time.toLowerCase()}
                                </p>
                            ))
                        ) : (
                            // FIX: Show different message when no day is selected vs when fully booked
                            <p className="text-gray-400 text-sm">
                                {slotIndex === null ? "Please select a day first" : "No available slots for this day"}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={bookAppointment}
                        disabled={!slotTime || loading}
                        className={`text-sm font-light px-14 py-3 rounded-full my-6 transition-all duration-300
                            ${slotTime && !loading
                                ? 'bg-primary text-white hover:scale-105 hover:shadow-lg'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {loading ? "Booking..." : "Book an appointment"}
                    </button>

                </div>
            ) : (
                <div className='sm:ml-72 sm:pl-4 mt-6'>
                    <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                        <p className='text-red-600 font-medium'>
                            Doctor is not available at the moment.
                        </p>
                    </div>
                </div>
            )}

            <RelatedDoctors
                speciality={docInfo.speciality}
                docId={docId}
            />

        </div>
    ) : null
}

export default Appointment