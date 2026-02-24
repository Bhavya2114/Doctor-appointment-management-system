import React, { useEffect, useContext, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorsList = () => {
  const [show, setShow] = useState(false)

  const { doctors, aToken, getAllDoctors } = useContext(AdminContext)
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const handleAvailabilityToggle = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/admin/change-availability',
        { docId },
        { headers: { aToken } }
      )

      if (data.success) {
        toast.success('Doctor availability updated')
        getAllDoctors()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    if (aToken) {
      getAllDoctors()
    }
  }, [aToken, getAllDoctors])
  useEffect(() => {
  setShow(true)
}, [])

  return (
 <div className={`w-full max-w-6xl m-5 transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <h1 className='text-lg font-medium'>All Doctors</h1>

      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>

        {doctors.map((item) => (
          <div
            key={item._id}
            className='border border-[#C9D8FF] rounded-xl max-w-56 overflow-hidden cursor-pointer group'
          >

            <img
              className='bg-[#EAEFFF] group-hover:bg-primary transition-all duration-500'
              src={item?.image}
              alt=""
            />

            <div className='p-4'>
              <p className='text-[#262626] text-lg font-medium'>
                {item?.name}
              </p>

              <p className='text-[#5C5C5C] text-sm'>
                {item?.speciality}
              </p>

              <div className='mt-2 flex items-center gap-1 text-sm'>
                <input
                  type="checkbox"
                  checked={item?.available}
                  onChange={() => handleAvailabilityToggle(item._id)}
                />
                <p>Available</p>
              </div>
            </div>

          </div>
        ))}

      </div>
    </div>
  )
}

export default DoctorsList
