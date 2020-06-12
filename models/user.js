const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  followers: [{ type: ObjectId, ref: "User" }],
  following: [{ type: ObjectId, ref: "User" }],
  pic: {
    type: String,
    default:
      "https://res.cloudinary.com/dbb4he4lk/image/upload/v1591015180/112815935-stock-vector-no-image-available-icon-flat-vector-illustration_h9qqxe.jpg",
  },
});

mongoose.model("User", userSchema);
