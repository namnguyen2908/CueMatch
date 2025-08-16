const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");


const authRoutes = require('./routes/Auth');
const postRoutes = require('./routes/Post');


dotenv.config();
const app = express();


app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none"); // <- bổ sung thêm cái này
  next();
});

const connectToMongo = async () => {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to MongoDB");
};
connectToMongo();

app.use(cors({
  origin: 'http://localhost:3000', // địa chỉ React app
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

//Routes
app.use('/auth', authRoutes);
app.use('/post', postRoutes);



app.listen(8000, () => {
    console.log("Server is running")
})

