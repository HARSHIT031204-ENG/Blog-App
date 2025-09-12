import { ErrorFunc } from "../Middlewares/Catch_Error.js";
import { Userauth, userModel} from "../Models/userModel.js";
import { Postcontent } from "../Models/userModel.js";
import { APIerror } from "../Middlewares/Api_Error.js";
import { SendOTp } from "../Utils/OtpCont.js";
import bcrypt from "bcrypt"
import uploadImage from "../Cloud/Cloudinary.js"
import cookieParser from "cookie-parser";
import axios from "axios";
import jwt from "jsonwebtoken";
import { oauth2client } from "../utils/Googleconfig.js";



// < ------------------------------ USER SIGNUP ----------------------------- >

export const Googlelogin = async (req, res) => {
  try {
    const { code } = req.query; 
    console.log("code getting from server google ", code);
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code missing",
      });
    }

    
    const { tokens } = await oauth2client.getToken(code);
    oauth2client.setCredentials(tokens);

    
    const { data } = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
    );

    const { email, name, picture } = data;

    
    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        name,
        email,
        image: picture,
      });
    }

    
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );


    console.log(token);
    
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,  // Correct 7 days in ms
      sameSite: "lax",  // or omit sameSite entirely for default behavior
      secure: false,    // Do NOT use secure in dev (no HTTPS)
    });


    return res.status(200).json({
      success: true,
      message: "User login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Google Login Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Google login failed",
      error: error.message,
    });
  }
};


export const Githublogin = async (req, res) => {
  try {
    const { code } = req.query;
    console.log("Code is getting ", code);
    
    if (!code) {
      return res.status(400).json({ message: "Authorization code missing" });
    }

    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { login, name, avatar_url, email } = userResponse.data;

    let userEmail = email;
    if (!userEmail) {
      const emailResponse = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const primaryEmail = emailResponse.data.find((e) => e.primary) || emailResponse.data[0];
      userEmail = primaryEmail?.email;
    }

    let user = await userModel.findOne({ email: userEmail });
    if (!user) {
      user = await userModel.create({
        name: name || login,
        email: userEmail,
        image: avatar_url,
      });
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ success: true, token, user });
  } catch (error) {
    console.error("GitHub OAuth Error:", error.message);
    res.status(500).json({ success: false, message: "GitHub login failed", error });
  }
}




// < ------------------------------  POST CONTENT START    ----------------------------- >

export const PostCont = async (req, res, next) => {
    try {

        const { title, tags, categories, description } = req.body
        if (!title || !tags || !categories || !description) {
            return next(new APIerror(400, "All Field are required!"))
        }

        if (!req.file) return next(new APIerror(400, "Image field is required "))

        const result = await uploadImage(req.file.path);


        const Prevtitle = await Postcontent.findOne({ title });
        if (Prevtitle) {
            return res.status(400).json({ success: false, message: "Title should not be duplicated" });
        }

        const newBlog = await Postcontent.create({
            title,
            tags,
            categories,
            description,
            coverimg: result.secure_url
        })

        return res.status(200).json({
            success: true,
            message: "Post content added successfully",
            post: newBlog
        })

    } catch (error) {
        console.error(error);

        return res.status(400).json({
            success: false,
            message: "Error in post content",
            error: error
        })
    }
}


// < ------------------------------ GENERATE OTP METHOD ----------------------------- >

const GenerateOtp = () => Math.floor(Math.random() * 100000 + 1)

// < ------------------------------ USER SIGNUP ----------------------------- >

export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return next(new APIerror(400, "All fiels are required .!"))
        }

        const validEmail = /^[A-Za-z0-9._%+-]+@gmail\.com$/
        if (!validEmail.test(email)) return next(new APIerror(400, "Email invalid "))

        const validPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
        if (!validPassword.test(password)) return next(new APIerror(400, "invalid password .!"))

        const ExistUser = await Userauth.findOne({ email })
        if (ExistUser) return next(new APIerror(400, "User exist already "))

        const otp = GenerateOtp()

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await Userauth.create({ name, email, password: hashedPassword, otp, otpExpire: Date.now() + 5 * 60 * 1000 })
        // await user.save()

        await SendOTp(email, otp)

        res.status(200).json({
            success: true,
            message: "otp successfully sent"
        })

    } catch (error) {
        console.log("Register error : ", error.message);

    }
}

// < ------------------------------ Verification OTP ----------------------------- >

export const verifyOtp = async (req, res, next) => {
    const { email, otp } = req.body

    const user = await Userauth.findOne({ email })

    if (!user) return next(new APIerror(400, "invalid user "))


    if (user.otp != otp) return next(new APIerror(400, " invalid otp "))

    if (Date.now() > user.otpExpire) return next(new APIerror(400, "otp expired "))

    user.isVerified = true,
        user.otp = undefined,
        user.otpExpire = undefined,
        await user.save()

    res.status(200).json({
        success: true,
        message: "email verified successfully"
    })
}

// < ------------------------------ USER LOGIN  ----------------------------- >

export const login = async (req, res, next) => {

    try {
        const { email, password } = req.body

        const user = await Userauth.findOne({ email })
        

        if (email != user.email) return next(new APIerror(400, "Invalid Email "))

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) return next(new APIerror(400, "Invalid password "))



        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })

        res.cookie("token", token, {
            httpOnly: true,
            // sameSite: "Strict",
            maxAge: 7 * (24 * 60 * 1000)
        })

        return res.status(200).json({
            success: true,
            message: "Succesfull logged in ...",
            user: {
                ID: user.ID,
                name: user.name,
                email: user.email
            }
        })

    } catch (error) {
        console.log("error in login scetion ", error);

    }

}

// < ------------------------------ USER AUTHENTICATED  ----------------------------- >

export const isAuthenticated = (req, res, next) => {
    const token = req.cookies.token
    console.log("token matter ",token);

    try {
        if (!token) return next(new APIerror(400, "First have to login "))

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET)

        if (!verifyToken) return next(new APIerror(400, "Not authenticated "))

        req.user = verifyToken
        next()
    } catch (error) {
        console.log("Error in isauthneticated section ", error.message);

    }

}

// < ------------------------------ USER LOGOUT  ----------------------------- >

export const logout = async (req, res, next) => {
    try {
        res.cookie("token", null, {
            expiresIn: new Date(Date.now()),
            httpOnly: true
        })


        res.status(200).json({
            success: true,
            message: "Logout successfull..."
        })
    } catch (error) {
        console.log(" error in logout section ", error.message);

    }
}

// < ------------------------------  RESEND OTP   ----------------------------- >

export const ResendOtp = async (req, res, next) => {
    try {
        const { email } = req.body
        const user = await Userauth.findOne({ email })

        if (!user) return next(new APIerror(400, "Invalid User "))
        console.log("resend otp error ", user.email);

        if (Date.now() > user.otpExpire) {
            console.log("Resend otp is sending ");
            const reotp = GenerateOtp()
            const otpExpire = Date.now() + (5 * 60 * 1000)

            user.otp = reotp,
                user.otpExpire = otpExpire

            await user.save()

            await SendOTp(email, reotp)
            return res.status(200).json({
                success: true,
                message: " Resend code is successfully sent !!"
            })

        } else {
            return res.status(400).json({
                success: false,
                message: "Otp is still validating "
            })
        }

    } catch (error) {
        console.log("error in resend otp", error);

    }

}



