import nodemailer from "nodemailer"

export const SendOTp = async (email, otp) => {
    try {

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            service : process.env.SMTP_SERVICE,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.Email_Otp,
                pass: process.env.Email_Pass
            }
        });


        const mailOptions = {
            from: `Harshit Garg `,
            to: email,
            subject: "Your otp for blog app ",
            text: `Your otp is ${otp}. it will expire within a 5 mins`
        }
        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.log("Error in otp", error.message);

    }

} 