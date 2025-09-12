import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: String,
  otpExpire: Date,
  isVerified : {type : Boolean, default : false}
}, { timestamps: true });

const GoogleSchema = new mongoose.Schema({
  name : {
    type: String,
  },
  email: {
    type: String,
  },
  image: {
    type: String,
  },
  
})

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  categories: { type: String, required: true },
  tags: { type: String, required: true },
  coverimg: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

export const Userauth = mongoose.model("User", UserSchema);
export const Postcontent = mongoose.model("Post", PostSchema)
export const userModel = mongoose.model("sociail-login", GoogleSchema)

