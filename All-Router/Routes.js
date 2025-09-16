import express from "express"
import { login, logout, isAuthenticated, verifyOtp, register, ResendOtp, PostCont, Googlelogin, Githublogin } from "../Controllers/Usercontroller.js";
import { allpostget } from "../Controllers/Usercontroller.js";
import { upload } from "../Multer-Cloud/Multer.js";



const router = express.Router()

router.post("/register", register)
router.post("/verifyOTP", verifyOtp)
router.post("/login", login)
router.post("/ResendOTP", ResendOtp)
router.get("/logout", isAuthenticated, logout)
router.post("/post", isAuthenticated, upload.single("coverimg"), PostCont);
router.get("/allpost", isAuthenticated, allpostget)
router.get("/auth/google", Googlelogin)
router.get("/auth/github", Githublogin)

export default router