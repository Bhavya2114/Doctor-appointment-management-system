import React, { useContext, useState, useEffect,useRef } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyProfile = () => {
  const [show, setShow] = useState(false);
const ref = useRef();

  const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => setShow(entry.isIntersecting),
    { threshold: 0.15 }
  );

  if (ref.current) observer.observe(ref.current);

  return () => observer.disconnect();
}, []);

  // Cleanup object URL (prevents memory leak)
  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image)
    }
  }, [image])

  // Update Profile API
  const updateUserProfileData = async () => {

    if (!backendUrl || !token) {
      toast.error("Authentication error. Please login again.")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('name', userData.name)
      formData.append('phone', userData.phone)
      formData.append('address', JSON.stringify(userData.address))
      formData.append('gender', userData.gender)
      formData.append('dob', userData.dob)

      if (image) {
        formData.append('image', image)
      }

      const { data } = await axios.post(
        `${backendUrl}/api/user/update-profile`,
        formData,
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        await loadUserProfileData()
        setIsEdit(false)
        setImage(null)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!userData) return null

  return (
  <div
  ref={ref}
  className={`max-w-2xl ml-0 md:ml-10 reveal ${show ? "active" : ""}`}
>

      {/* Profile Image */}
      {isEdit ? (
        <label htmlFor='image' className='relative inline-block cursor-pointer'>
<img
  className='w-36 h-36 object-cover rounded-full border border-gray-300 opacity-90'
  src={
    image
      ? URL.createObjectURL(image)
      : userData?.image || assets.profile_pic
  }
  onError={(e) => (e.target.src = assets.profile_pic)}
  alt="Profile"
/>
          <img
            className='w-8 absolute bottom-3 right-3'
            src={assets.upload_icon}
            alt="Upload"
          />
          <input
            id='image'
            type='file'
            hidden
            onChange={(e) => setImage(e.target.files[0])}
          />
        </label>
      ) : (
       <img
  className='w-36 h-36 object-cover rounded-full border border-gray-300'
  src={userData?.image || assets.profile_pic}
  onError={(e) => (e.target.src = assets.profile_pic)}
  alt="Profile"
/>
      )}

      {/* Name */}
      {isEdit ? (
        <input
          className='bg-gray-50 text-3xl font-medium max-w-60 mt-4 p-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40'
          type="text"
          value={userData.name}
          onChange={(e) =>
            setUserData(prev => ({ ...prev, name: e.target.value }))
          }
        />
      ) : (
        <p className='font-medium text-3xl text-gray-800 mt-4'>
          {userData.name}
        </p>
      )}

      <hr className='border-t border-gray-200 mt-3' />

      {/* Contact Information */}
      <div>
        <p className='text-gray-500 underline mt-4'>CONTACT INFORMATION</p>

        <div className='grid grid-cols-[1fr_3fr] gap-y-3 mt-3 text-gray-700'>

          <p className='font-medium'>Email:</p>
          <p className='text-blue-500'>{userData.email}</p>

          <p className='font-medium'>Phone:</p>
          {isEdit ? (
            <input
              className='bg-gray-50 p-2 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary/40'
              value={userData.phone}
              onChange={(e) =>
                setUserData(prev => ({ ...prev, phone: e.target.value }))
              }
            />
          ) : (
            <p>{userData.phone}</p>
          )}

          <p className='font-medium'>Address:</p>
          {isEdit ? (
            <div>
              <input
                className='bg-gray-50 p-2 rounded border border-gray-200 w-full mb-2 focus:outline-none focus:ring-1 focus:ring-primary/40'
                value={userData.address.line1}
                onChange={(e) =>
                  setUserData(prev => ({
                    ...prev,
                    address: { ...prev.address, line1: e.target.value }
                  }))
                }
              />
              <input
                className='bg-gray-50 p-2 rounded border border-gray-200 w-full focus:outline-none focus:ring-1 focus:ring-primary/40'
                value={userData.address.line2}
                onChange={(e) =>
                  setUserData(prev => ({
                    ...prev,
                    address: { ...prev.address, line2: e.target.value }
                  }))
                }
              />
            </div>
          ) : (
            <p>
              {userData.address.line1} <br />
              {userData.address.line2}
            </p>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div>
        <p className='text-gray-500 underline mt-4'>BASIC INFORMATION</p>

        <div className='grid grid-cols-[1fr_3fr] gap-y-3 mt-3 text-gray-700'>

          <p className='font-medium'>Gender:</p>
          {isEdit ? (
            <select
              className='bg-gray-50 p-2 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary/40'
              value={userData.gender}
              onChange={(e) =>
                setUserData(prev => ({ ...prev, gender: e.target.value }))
              }
            >
              <option value="Not Selected">Not Selected</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <p>{userData.gender}</p>
          )}

          <p className='font-medium'>Birthday:</p>
          {isEdit ? (
            <input
              className='bg-gray-50 p-2 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary/40'
              type='date'
              value={userData.dob}
              onChange={(e) =>
                setUserData(prev => ({ ...prev, dob: e.target.value }))
              }
            />
          ) : (
            <p>{new Date(userData.dob).toLocaleDateString()}</p>
          )}

        </div>
      </div>

      {/* Action Button */}
      <div className='mt-8'>
        {isEdit ? (
          <button
            disabled={loading}
            onClick={updateUserProfileData}
            className={`border border-primary px-8 py-2 rounded-full transition-all
              ${loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'hover:bg-primary hover:text-white'
              }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'
          >
            Edit
          </button>
        )}
      </div>

    </div>
  )
}

export default MyProfile
