require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { z } = require("zod");
const { User, Todo } = require("./db.js");
const JWT_SECRET = process.env.JWT_SECRET;

async function startMongo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI + "todo-app");
    console.log("DB Connected Successfully.");
  } catch (err) {
    console.log(err);
  }
}

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
  try {
    const requiredBody = z.object({
      name: z.string().min(3).max(100),
      email: z.string().min(3).max(100).email(),
      password: z.string().min(3).max(30),
    });
    // const parsedData = requiredBody.parse(req.body)
    const parseDataWithSuccess = requiredBody.safeParse(req.body);
    if (!parseDataWithSuccess.success) {
      return res.status(400).json({
        message: "Incorrect format",
      });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 5);
    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
  } catch (e) {
    return res.status(400).json({ message: "User already exists." });
  }
  return res.status(200).json({ message: "You are signed up." });
});

app.post("/signin", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    return res.status(401).json({
      message: "User not found.",
    });
  }
  const passwordMatch = await bcrypt.compare(req.body.password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({
      message: "Invalid credentials.",
    });
  }
  const token = jwt.sign(
    {
      _id: user._id,
    },
    JWT_SECRET
  );
  return res.status(200).json({
    token,
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

app.listen(3000, async () => {
  console.log("Server is listening on port 3000.");
  await startMongo();
});
