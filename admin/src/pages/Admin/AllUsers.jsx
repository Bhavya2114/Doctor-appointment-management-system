import React, { useEffect, useContext, useState } from 'react'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
const AllUsers = () => {
  const [show, setShow] = useState(false)

  const { aToken } = useContext(AdminContext)
  const { backendUrl, calculateAge } = useContext(AppContext)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get(
          backendUrl + '/api/admin/users',
          { headers: { aToken } }
        )

        if (data.success) {
          setUsers(data.users)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (aToken) {
      fetchUsers()
    }
  }, [aToken, backendUrl])
  useEffect(() => {
  setShow(true)
}, [])

  return (
   <div className={`w-full max-w-6xl m-5 transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>

      <p className='mb-3 text-lg font-medium'>All Users</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-auto'>

        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_1.5fr_3fr_2fr_1fr_1.5fr] py-3 px-6 border-b'>
          <p>#</p>
          <p>User</p>
          <p>Age</p>
          <p>Gender</p>
          <p>Email</p>
          <p>Phone</p>
          <p>Total Bookings</p>
          <p>Joined On</p>
        </div>

        {loading ? (
          <p className="p-6 text-gray-500">Loading users...</p>
        ) : (
          users.map((item, index) => (
          <div
            key={item._id}
            className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_1.5fr_3fr_2fr_1fr_1.5fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50'
          >

            <p className='max-sm:hidden'>{index + 1}</p>

            <div className='flex items-center gap-2'>
             <img
  src={item?.image || assets.profile_pic}
  onError={(e) => (e.target.src = assets.profile_pic)}
  className='w-8 h-8 rounded-full object-cover'
  alt=''
/>
              <p>{item?.name}</p>
            </div>

            <p className='max-sm:hidden'>
              {item?.dob && item?.dob !== 'Not Selected' ? calculateAge(item.dob) : '-'}
            </p>

            <p>{item?.gender || '-'}</p>

            <p>{item?.email}</p>

            <p>{item?.phone || '-'}</p>

            <p>{item?.totalBookings ?? 0}</p>

            <p>
              {item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
            </p>

          </div>
          ))
        )}

      </div>
    </div>
  )
}

export default AllUsers
