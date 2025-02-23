const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.ObjectId;

const UserSchema = new Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
});

const TodoSchema = new Schema({
  userId: ObjectId,
  title: String,
  done: Boolean,
});

const User = mongoose.model("users", UserSchema);
const Todo = mongoose.model("todos", TodoSchema);

module.exports = {
  User,
  Todo,
};
