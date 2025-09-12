import mongoose from "mongoose";

export const connection = async () => {
    await mongoose.connect(process.env.MONGO_URL, {
        dbName: "Blog_Dev"
    }).then(() => {
        console.log("Database connected ..!");
        
    }).catch((error) => {
        console.log(error.message);
        console.log("Database not connected ..!");

    })
}