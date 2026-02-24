import React, { useContext, useEffect, useState, useRef } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const DoctorProfile = () => {
    

    const { dToken, profileData, getProfileData } = useContext(DoctorContext)
    const { currency, backendUrl } = useContext(AppContext)

    const [isEdit, setIsEdit] = useState(false)
    const [loading, setLoading] = useState(false)
   
    const [editData, setEditData] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)

    const fileInputRef = useRef(null)
   const [show, setShow] = useState(false)


    // ✅ Ensure workingHours always exists
    useEffect(() => {
        if (profileData) {
            setEditData({
                ...profileData,
                workingHours: profileData.workingHours || {
                    startTime: "10:00",
                    endTime: "16:40"
                }
            })
        }
    }, [profileData])
    useEffect(() => {
  setShow(true)
}, [])

    useEffect(() => {
        if (dToken) {
            getProfileData()
        }
    }, [dToken])

    const updateProfile = async () => {
        try {
            setLoading(true)

            const formData = new FormData()

            formData.append("fees", editData.fees)
            formData.append("about", editData.about)
            formData.append("available", editData.available)
            formData.append("address", JSON.stringify(editData.address))

            // ✅ NEW: Working Hours
            formData.append("startTime", editData.workingHours?.startTime)
            formData.append("endTime", editData.workingHours?.endTime)

            if (selectedImage) {
                formData.append("image", selectedImage)
            }

            const { data } = await axios.post(
                backendUrl + '/api/doctor/update-profile',
                formData,
                {
                    headers: {
                        dToken,
                        "Content-Type": "multipart/form-data"
                    }
                }
            )

            if (data.success) {
                toast.success(data.message)
                setIsEdit(false)
                setSelectedImage(null)
                getProfileData()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.error(error)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (!profileData || !editData) {
  return (
   <div
  className={`w-full max-w-6xl m-5 transition-all duration-500 ${
    show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
  }`}
>
      Loading profile...
    </div>
  )
}

    return (
       <div
  className={`m-5 transition-all duration-500 ${
    show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
  }`}
>
            <div className='flex flex-col gap-4'>

                {/* Image Section */}
                <div className='flex flex-col items-start gap-2'>
                    <img
                        className='bg-primary/80 w-full sm:max-w-64 rounded-lg'
                        src={selectedImage ? URL.createObjectURL(selectedImage) : profileData?.image}
                        alt=""
                    />

                    {isEdit && (
                        <>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                hidden
                                onChange={(e) => setSelectedImage(e.target.files[0])}
                            />

                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className='px-3 py-1 text-sm border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-all'
                            >
                                Change Photo
                            </button>
                        </>
                    )}
                </div>

                <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white'>

                    <p className='text-3xl font-medium text-gray-700'>
                        {profileData?.name}
                    </p>

                    <div className='flex items-center gap-2 mt-1 text-gray-600'>
                        <p>{profileData?.degree} - {profileData?.speciality}</p>
                        <span className='py-0.5 px-2 border text-xs rounded-full'>
                            {profileData?.experience}
                        </span>
                    </div>

                    {/* About */}
                    <div className='mt-3'>
                        <p className='text-sm font-medium text-[#262626]'>About :</p>

                        {isEdit ? (
                            <textarea
                                rows={6}
                                className='w-full outline-primary p-2 mt-1 border rounded'
                                value={editData.about || ''}
                                onChange={(e) =>
                                    setEditData(prev => ({
                                        ...prev,
                                        about: e.target.value
                                    }))
                                }
                            />
                        ) : (
                            <p className='text-sm text-gray-600 mt-1 max-w-175'>
                                {profileData?.about}
                            </p>
                        )}
                    </div>

                    {/* Fees */}
                    <p className='text-gray-600 font-medium mt-4'>
                        Appointment fee:{' '}
                        <span className='text-gray-800'>
                            {currency}{' '}
                            {isEdit ? (
                                <input
                                    type='number'
                                    className='border px-2 py-1 rounded'
                                    value={editData.fees || ''}
                                    onChange={(e) =>
                                        setEditData(prev => ({
                                            ...prev,
                                            fees: e.target.value
                                        }))
                                    }
                                />
                            ) : profileData?.fees}
                        </span>
                    </p>

                    {/* Address */}
                    <div className='flex gap-2 py-2'>
                        <p>Address:</p>
                        <div className='text-sm'>
                            {isEdit ? (
                                <>
                                    <input
                                        type='text'
                                        className='border px-2 py-1 rounded mb-1'
                                        value={editData.address?.line1 || ''}
                                        onChange={(e) =>
                                            setEditData(prev => ({
                                                ...prev,
                                                address: {
                                                    ...prev.address,
                                                    line1: e.target.value
                                                }
                                            }))
                                        }
                                    />
                                    <br />
                                    <input
                                        type='text'
                                        className='border px-2 py-1 rounded'
                                        value={editData.address?.line2 || ''}
                                        onChange={(e) =>
                                            setEditData(prev => ({
                                                ...prev,
                                                address: {
                                                    ...prev.address,
                                                    line2: e.target.value
                                                }
                                            }))
                                        }
                                    />
                                </>
                            ) : (
                                <>
                                    {profileData?.address?.line1}
                                    <br />
                                    {profileData?.address?.line2}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Availability */}
                    <div className='flex gap-2 items-center pt-2'>
                        <input
                            type="checkbox"
                            disabled={!isEdit}
                            checked={editData.available}
                            onChange={() =>
                                setEditData(prev => ({
                                    ...prev,
                                    available: !prev.available
                                }))
                            }
                        />
                        <label>Available</label>
                    </div>

                    {/* ✅ Working Hours */}
                    <div className='mt-4'>
                        <p className='text-gray-600 font-medium'>Working Hours:</p>

                        {isEdit ? (
                            <div className='flex gap-4 mt-2'>
                                <input
                                    type="time"
                                    className='border px-2 py-1 rounded'
                                    value={editData.workingHours?.startTime || ''}
                                    onChange={(e) =>
                                        setEditData(prev => ({
                                            ...prev,
                                            workingHours: {
                                                ...prev.workingHours,
                                                startTime: e.target.value
                                            }
                                        }))
                                    }
                                />

                                <input
                                    type="time"
                                    className='border px-2 py-1 rounded'
                                    value={editData.workingHours?.endTime || ''}
                                    onChange={(e) =>
                                        setEditData(prev => ({
                                            ...prev,
                                            workingHours: {
                                                ...prev.workingHours,
                                                endTime: e.target.value
                                            }
                                        }))
                                    }
                                />
                            </div>
                        ) : (
                            <p className='text-sm text-gray-600 mt-1'>
                                {profileData?.workingHours?.startTime} - {profileData?.workingHours?.endTime}
                            </p>
                        )}
                    </div>

                    {/* Buttons */}
                    {isEdit ? (
                        <button
                            onClick={updateProfile}
                            disabled={loading}
                            className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all disabled:opacity-60'
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEdit(true)}
                            className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'
                        >
                            Edit
                        </button>
                    )}

                </div>
            </div>
        </div>
    )
}

export default DoctorProfile