const mongoose = require("mongoose");
const { Schema, model } = mongoose;
mongoose.connect("mongodb://127.0.0.1:27017/dataAssociation");

const userSchema = Schema({
  name: String,
  age: Number,
  email: String,
  password: String,
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

module.exports = mongoose.model("user", userSchema);
