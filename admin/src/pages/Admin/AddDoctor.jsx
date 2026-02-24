import React, { useEffect, useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AddDoctor = () => {
    const [show, setShow] = useState(false)

    const [docImg, setDocImg] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [experience, setExperience] = useState('1 Year')
    const [fees, setFees] = useState('')
    const [about, setAbout] = useState('')
    const [speciality, setSpeciality] = useState('General physician')
    const [degree, setDegree] = useState('')
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')
    const [loading, setLoading] = useState(false)

    const { backendUrl } = useContext(AppContext)
    const { aToken } = useContext(AdminContext)

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        if (!docImg) {
            return toast.error('Image Not Selected')
        }

        try {
            setLoading(true)

            const formData = new FormData()

            formData.append('image', docImg)
            formData.append('name', name)
            formData.append('email', email)
            formData.append('password', password)
            formData.append('experience', experience)
            formData.append('fees', Number(fees))
            formData.append('about', about)
            formData.append('speciality', speciality)
            formData.append('degree', degree)
            formData.append(
                'address',
                JSON.stringify({ line1: address1, line2: address2 })
            )

            const { data } = await axios.post(
                backendUrl + '/api/admin/add-doctor',
                formData,
                { headers: { aToken } }
            )

            if (data.success) {
                toast.success(data.message)

                setDocImg(false)
                setName('')
                setEmail('')
                setPassword('')
                setExperience('1 Year')
                setFees('')
                setAbout('')
                setSpeciality('General physician')
                setDegree('')
                setAddress1('')
                setAddress2('')
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
    useEffect(() => {
  setShow(true)
}, [])

    return (
        <form onSubmit={onSubmitHandler} className={`w-full max-w-6xl m-5 transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <p className='mb-3 text-lg font-medium'>Add Doctor</p>

            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-auto'>

                {/* Image Upload */}
                <div className='flex items-center gap-4 mb-8 text-gray-500'>
                    <label htmlFor="doc-img">
                        <img
                            className='w-16 bg-gray-100 rounded-full cursor-pointer'
                            src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                            alt=""
                        />
                    </label>
                    <input
                        type="file"
                        id="doc-img"
                        accept="image/*"
                        onChange={(e) => setDocImg(e.target.files[0])}
                        hidden
                    />
                    <p>Upload doctor <br /> picture</p>
                </div>

                {/* Form Layout */}
                <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>

                    {/* Left Column */}
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>

                        <div>
                            <p>Your Name</p>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                type="text"
                                className='border rounded px-3 py-2 w-full'
                                required
                            />
                        </div>

                        <div>
                            <p>Doctor Email</p>
                            <input
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                type="email"
                                className='border rounded px-3 py-2 w-full'
                                required
                            />
                        </div>

                        <div>
                            <p>Set Password</p>
                            <input
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                type="password"
                                className='border rounded px-3 py-2 w-full'
                                required
                            />
                        </div>

                        <div>
                            <p>Experience</p>
                            <select
                                value={experience}
                                onChange={e => setExperience(e.target.value)}
                                className='border rounded px-3 py-2 w-full'
                            >
                                <option>1 Year</option>
                                <option>2 Years</option>
                                <option>3 Years</option>
                                <option>4 Years</option>
                                <option>5 Years</option>
                                <option>6 Years</option>
                                <option>8 Years</option>
                                <option>9 Years</option>
                                <option>10+ Years</option>
                            </select>
                        </div>

                        <div>
                            <p>Fees</p>
                            <input
                                value={fees}
                                onChange={e => setFees(e.target.value)}
                                type="number"
                                className='border rounded px-3 py-2 w-full'
                                required
                            />
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>

                        <div>
                            <p>Speciality</p>
                            <select
                                value={speciality}
                                onChange={e => setSpeciality(e.target.value)}
                                className='border rounded px-3 py-2 w-full'
                            >
                                <option>General physician</option>
                                <option>Gynecologist</option>
                                <option>Dermatologist</option>
                                <option>Pediatricians</option>
                                <option>Neurologist</option>
                                <option>Gastroenterologist</option>
                            </select>
                        </div>

                        <div>
                            <p>Degree</p>
                            <input
                                value={degree}
                                onChange={e => setDegree(e.target.value)}
                                type="text"
                                className='border rounded px-3 py-2 w-full'
                                required
                            />
                        </div>

                        <div className='flex flex-col gap-1'>
                            <p>Address</p>
                            <input
                                value={address1}
                                onChange={e => setAddress1(e.target.value)}
                                className='border rounded px-3 py-2'
                                placeholder='Address 1'
                                required
                            />
                            <input
                                value={address2}
                                onChange={e => setAddress2(e.target.value)}
                                className='border rounded px-3 py-2'
                                placeholder='Address 2'
                                required
                            />
                        </div>

                    </div>

                </div>

                {/* About Section */}
                <div>
                    <p className='mt-4 mb-2'>About Doctor</p>
                    <textarea
                        value={about}
                        onChange={e => setAbout(e.target.value)}
                        className='w-full px-4 pt-2 border rounded'
                        rows={5}
                        placeholder='Write about doctor'
                    />
                </div>

                {/* Submit Button */}
                <button
                    type='submit'
                    disabled={loading}
                    className='bg-blue-600 px-10 py-3 mt-4 text-white rounded-full disabled:opacity-60'
                >
                    {loading ? "Adding..." : "Add Doctor"}
                </button>

            </div>
        </form>
    )
}

export default AddDoctor