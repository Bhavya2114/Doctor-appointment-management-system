import jwt from "jsonwebtoken"

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {

        const atoken = req.headers.atoken

        if (!atoken) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }

        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET)

        if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }

        next()

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default authAdmin

/*
Responsibility: Verify request is from admin (superuser)
Used on: Admin-only routes (add doctor, view all appointments, dashboard)
Different from authUser: Hardcoded admin credentials (no DB lookup)
*/