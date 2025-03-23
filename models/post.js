const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const postSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  content: String,
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("post", postSchema);
