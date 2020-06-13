const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");
const requireLogin = require("../midlleware/requireLogin");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
//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

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

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
            console.log(user);
            console.log(user.email);
            transporter.sendMail({
              to: user.email,
              from: "no-reply@bloggers.com",
              subject: "Sign Up",
              html: "<h1>Welcome to Bloggers</h1>",
            });
            console.log(user);
            res.json({ message: "Saved Successfully" });
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

router.post("/resetpassword", (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        return res.status(422).json({ error: "User doesn't Exists" });
      }
      user.resetToken = token;
      user.expireToken = Date.now() + 3600000;
      user.save().then((result) => {
        transporter.sendMail({
          to: user.email,
          from: "no-reply@bloggers.com",
          subject: "Reset Password",
          html: `
          <p>Reset Password</p>
          <h5>Click on this link to <a href="/reset/${token}">reset your password</a></h5>
          `,
        });
        console.log(user);
        res.json({ message: "Check your Email" });
      });
    });
  });
});

router.post("/new-password", (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token;
  User.findOne({
    resetToken: sentToken,
    expireToken: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        return res.status(422).json({ error: "Try Again,Session Expired" });
      }
      bcrypt.hash(newPassword, 12).then((hashedpassword) => {
        user.password = hashedpassword;
        user.resetToken = undefined;
        user.expireToken = undefined;
        user.save().then((savedUser) => {
          res.json({ message: "Password Updated" });
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
