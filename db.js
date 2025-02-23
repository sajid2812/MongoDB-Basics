const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const UserSchema = new Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
});
const User = mongoose.model("User", UserSchema);

const TodoSchema = new Schema({
  userId: {
    type: ObjectId,
    ref: "User",
  },
  title: String,
  done: Boolean,
});

const Todo = mongoose.model("Todo", TodoSchema);

module.exports = {
  User,
  Todo,
};
