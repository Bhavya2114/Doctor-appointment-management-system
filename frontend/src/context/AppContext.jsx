import { createContext, useEffect, useState, useCallback, useRef } from "react"
import { toast } from "react-toastify"
import axios from "axios"
import { io } from "socket.io-client"

export const AppContext = createContext()

const AppContextProvider = ({ children }) => {

    const currencySymbol = "₹"
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    // ----- State -----
    const [doctors, setDoctors] = useState([])
    const [token, setTokenState] = useState(localStorage.getItem("token") || "")
    const [userData, setUserData] = useState(null)
    // [SOCKET] Signal used by pages to re-fetch from REST source of truth
    const [appointmentUpdateSignal, setAppointmentUpdateSignal] = useState(0)
    const socketRef = useRef(null)

    // ----- Token Updater (Keeps localStorage in sync) -----
    const setToken = (newToken) => {
        if (newToken) {
            localStorage.setItem("token", newToken)
            setTokenState(newToken)
        } else {
            localStorage.removeItem("token")
            setTokenState("")
            setUserData(null)
            // [SOCKET] Disconnect immediately on logout
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
            }
        }
    }

    // ----- Fetch Doctors -----
    const getDoctorsData = useCallback(async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/doctor/list`)

            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || error.message)
        }
    }, [backendUrl])

    // ----- Fetch Logged-in User Profile -----
    const loadUserProfileData = useCallback(async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/user/get-profile`,
                { headers: { token } }
            )

            if (data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || error.message)
        }
    }, [backendUrl, token])

    // ----- Effects -----
    useEffect(() => {
        if (backendUrl) {
            getDoctorsData()
        } else {
            console.error("VITE_BACKEND_URL is not defined")
        }
    }, [backendUrl, getDoctorsData])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
        }
    }, [token, loadUserProfileData])

    // [SOCKET] Connect when token exists, authenticate with JWT, cleanup safely
    useEffect(() => {
        if (!backendUrl || !token) {
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
            }
            return
        }

        const socket = io(backendUrl, {
            auth: { token },
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000
        })

        socketRef.current = socket

        socket.on("appointment:updated", () => {
            setAppointmentUpdateSignal((prev) => prev + 1)
        })

        return () => {
            socket.off("appointment:updated")
            socket.disconnect()
            if (socketRef.current === socket) {
                socketRef.current = null
            }
        }
    }, [backendUrl, token])

    // ----- Context Value -----
    const value = {
        doctors,
        getDoctorsData,
        currencySymbol,
        backendUrl,
        token,
        setToken,
        userData,
        setUserData,
        loadUserProfileData,
        appointmentUpdateSignal
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextProvider
