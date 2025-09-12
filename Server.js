import app from "./Index.js"



app.listen(process.env.PORT, () => {
    console.log(`Server is listening at port ${process.env.PORT}`);
})