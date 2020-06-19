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
const emailjs = require("emailjs-com");
//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

// const transporter = nodemailer.createTransport(
//   sendgridTransport({
//     auth: {
//       api_key:
//         "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",
//     },
//   })
// );

router.post("/signup", (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!email || !password || !name) {
    return res.status(422).json({ error: "Please add all the field" });
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res.status(422).json({ error: "User already exist" });
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
            // transporter.sendMail({
            //   to: user.email,
            //   from: "no-reply@bloggers.com",
            //   subject: "Sign Up",
            //   html: "<h1>Welcome to Bloggers</h1>",
            // });
            // console.log(user);
            // res.json({ message: "Saved Successfully" });
            // const templateParams = {
            //   from_name: user.email,
            //   to_name: "no-reply@thebolggers.com",
            //   subject: "Sign Up",
            //   message_html: "<h1>Welcome to Bloggers</h1>",
            // };

            // emailjs.send(
            //   "gmail",
            //   "template_lUZQmoEa",
            //   templateParams,
            //   "user_krkTTojdKoI3rSUV9IM9x"
            // );

            // const mailjet = require("node-mailjet").connect(
            //   "93a1b5b16e9e9ec4051ed89e5eef2ae8",
            //   "4569e58b492ac4487466b86f5cb13ce0"
            // );
            // const request = mailjet.post("send", { version: "v3.1" }).request({
            //   Messages: [
            //     {
            //       From: {
            //         Email: "namansharma885959168@gmail.com",
            //         Name: "Naman",
            //       },
            //       To: [
            //         {
            //           Email: "namansharma168@gmail.com",
            //           Name: "Naman",
            //         },
            //       ],
            //       Subject: "Greetings from Mailjet.",
            //       TextPart: "My first Mailjet email",
            //       HTMLPart:
            //         "<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!",
            //       CustomID: "AppGettingStartedTest",
            //     },
            //   ],
            // });
            // request
            //   .then((result) => {
            //     console.log(result.body);
            //   })
            //   .catch((err) => {
            //     console.log(err.statusCode);
            //   });

            var transporter = nodemailer.createTransport({
              host: "smtp.gmail.com",
              port: 465,
              secure: true, // use SSL
              auth: {
                user: "bloggerswebsite123@gmail.com", //enter email you want to send mail from,
                pass: "naman1712", //enter passsword
              },
              tls: {
                rejectUnauthorized: false,
              },
            });

            var mailOptions = {
              from: '"Nodemailer Bot" <nodemailer007@gmail.com>',
              to: "namansharma168@gmail.com",
              subject: "Message from Nodemailer",
              text: "New Mail! Name: " + "Email: " + +"Message: ",

              html: "<p>New Mail!</p><ul><li>" + "</li></ul>",
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
                res.redirect("/");
              } else {
                console.log("Message Sent: " + info.response);
                res.redirect("/");
              }
            });

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
