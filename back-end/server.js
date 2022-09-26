const express = require("express");
const connectDB = require("./config/db");
var colors = require("colors");
const path = require("path");

// dotenv.config();
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

//database connection
connectDB();
const app = express();

app.use(express.json()); // to accept json data

app.get("/", (req, res) => {
  res.send("Welcome to chat app");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}...`.yellow.bold);
});
