import { useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"

const PaymentStatus = () => {

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {

    const verify = async () => {

      const orderId = searchParams.get("order_id")

      if (!orderId) return

      try {

        console.log("🔍 Verifying payment:", orderId)

        const { data } = await axios.get(
          `http://localhost:4000/api/payment/verify/${orderId}`
        )

        if (data.success && data.status === "PAID") {
          // FIX 1: Replaced alert with toast for clean UX
          toast.success("Payment Successful ✅")
          navigate("/my-appointments")
        } else {
          // FIX 1: Replaced alert with toast for clean UX
          toast.error("Payment Failed ❌")
          navigate("/my-appointments")
        }

      } catch (error) {
        console.log(error)
        // FIX 1: Replaced alert with toast for clean UX
        toast.error("Verification Error")
        navigate("/my-appointments")
      }

    }

    verify()

  }, [])

  return <h2>Verifying Payment...</h2>
}

export default PaymentStatus