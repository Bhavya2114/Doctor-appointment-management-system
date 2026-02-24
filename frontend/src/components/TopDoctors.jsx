import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const TopDoctors = () => {

    const navigate = useNavigate()
    const { doctors } = useContext(AppContext)

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>

            <h1 className='text-3xl font-medium'>Top Doctors to Book</h1>

            <p className='sm:w-1/3 text-center text-sm'>
                Simply browse through our extensive list of trusted doctors.
            </p>

            {/* Responsive Grid (Safe + Native Tailwind) */}
            <div className='w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-5 gap-y-6 px-3 sm:px-0'>

                {doctors?.slice(0, 10).map((item) => (

                    <div
                        key={item._id}
                        onClick={() => {
                            navigate(`/appointment/${item._id}`)
                            window.scrollTo(0, 0)
                        }}
                        className='group border border-primary/30 rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20'
                    >

                        <img
                          className='bg-gradient-to-br from-[#eef6fb] to-[#dbeafe] w-full h-48 object-cover'
                            src={item.image}
                            alt={item.name}
                        />

                        <div className='p-4'>

                            {/* Dynamic Availability */}
                            <div className={`flex items-center gap-2 text-sm ${
                                item.available ? 'text-green-500' : 'text-gray-500'
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${
                                    item.available ? 'bg-green-500' : 'bg-gray-500'
                                }`}></span>

                                <span>
                                    {item.available ? 'Available' : 'Not Available'}
                                </span>
                            </div>

                            <p className='text-gray-900 text-lg font-medium'>
                                {item.name}
                            </p>

                            <p className='text-gray-600 text-sm'>
                                {item.speciality}
                            </p>

                        </div>

                    </div>

                ))}

            </div>

            <button
  onClick={() => {
    navigate('/doctors')
    window.scrollTo(0, 0)
  }}
  className='btn-global px-12 py-3 rounded-full mt-10'
>
  More
</button>

        </div>
    )
}

export default TopDoctors
