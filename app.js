const express = require("express");
const app = express();
const ejs = require("ejs");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const userModel = require("./models/user.js");
const jwt = require("jsonwebtoken");

// middlewares
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", async (req, res) => {
  let { name, age, email, password, address } = req.body;
  let user = await userModel.findOne({ email });

  if (user) {
    return res.status(200).send("User already registered");
  }

  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      let user = userModel.create({
        name,
        age,
        email,
        password: hash,
        address,
      });
      const token = jwt.sign({ email: email, userId: user._id }, "shhh");
      res.cookie("token", token);
      res.send("ok");
    });
  });
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) return res.status(500).send("Something went wrong");
  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      res.status(200).send("You are logged in");
    } else {
      res.redirect("/login");
    }
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
