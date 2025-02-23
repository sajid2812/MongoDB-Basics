require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { User, Todo } = require("./db.js");
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(process.env.MONGODB_URI + "todo-app");

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
  await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  return res.status(200).json({ message: "You are logged in." });
});

app.post("/signin", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password,
  });
  if (user) {
    const token = jwt.sign(
      {
        _id: user._id,
      },
      JWT_SECRET
    );
    return res.status(200).json({
      token,
    });
  }
  return res.status(401).json({
    message: "Invalid credentials.",
  });
});

app.post("/todo", async (req, res) => {});

app.get("/todos", async (req, res) => {});

app.listen(3000, () => {
  console.log("Server is listening on port 3000.");
});
