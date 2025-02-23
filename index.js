require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { User, Todo } = require("./db.js");
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(process.env.MONGODB_URI + "todo-app");

const app = express();
app.use(express.json());

function auth(req, res, next) {
  try {
    if (!req.headers.token) {
      return res.status(401).json({ message: "Token missing in header." });
    }
    const decodedInfo = jwt.verify(req.headers.token, process.env.JWT_SECRET);
    req.user = decodedInfo;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
}

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

app.post("/todo", auth, async (req, res) => {
  try {
    await Todo.create({
      userId: req.user._id,
      title: req.body.title,
      done: false,
    });
    return res.status(200).json({ message: "Todo added successfully." });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
});

app.get("/todos", auth, async (req, res) => {
  const todos = await Todo.find(
    {
      userId: req.user._id,
    },
    {
      userId: 1,
      title: 1,
      done: 1,
    }
  ).populate("userId", "name email");
  return res.status(200).json(todos);
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000.");
});
