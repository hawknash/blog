const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");
const requireLogin = require("../midlleware/requireLogin");

router.post("/signup", (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!email || !password || !name) {
    res.status(422).json({ error: "Please add all the field" });
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        res.status(422).json({ error: "User already exist" });
      }
      bcrypt.hash(password, 12).then((hashedpassword) => {
        const user = new User({
          email,
          password: hashedpassword,
          name,
          pic,
        });
        user
          .save()
          .then((user) => {
            res.json({ message: "saved successfully" });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "Please enter Email or Password" });
  }
  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: "Invalid Email/Password" });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then((doMatch) => {
        if (doMatch) {
          // res.json({ message: "Successfully SignedIn" });
          const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
          const { _id, name, email, followers, following, pic } = savedUser;
          res.json({
            token,
            user: { _id, name, email, followers, following, pic },
          });
        } else {
          return res.status(422).json({ error: "Invalid Email/Password" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

module.exports = router;
