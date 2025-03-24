const express = require("express");
const app = express();
const ejs = require("ejs");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const userModel = require("./models/user.js");
const postModel = require("./models/post.js");
const jwt = require("jsonwebtoken");
const path = require("path");
const upload = require("./config/multerConfig.js");

// middlewares
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/profilePic", isLoggedIn, (req, res) => {
  res.render("profilePic", { user: req.user });
});
app.post(
  "/profilePic",
  isLoggedIn,
  upload.single("profile"),
  async (req, res) => {
    const user = await userModel.findOne({ email: req.user.email });
    console.log(req.file, "user");
    user.profilePic = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);

app.get("/edit/:id", async (req, res) => {
  const id = req.params.id;
  const post = await postModel.findOne({ _id: id });
  res.render("edit", { post });
});

app.post("/edit/:id", async (req, res) => {
  const post_id = await req.params.id;
  const post = await postModel.findOneAndUpdate(
    { _id: post_id },
    { content: req.body.content }
  );
  res.redirect("/profile");
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) return res.status(500).send("Something went wrong");
  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      const token = jwt.sign({ email: email, userId: user._id }, "shhh");
      res.cookie("token", token);
      res.status(200).redirect("/profile");
    } else {
      res.redirect("/login");
    }
  });
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

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

app.get("/profile", isLoggedIn, async (req, res) => {
  // console.log(req.user);
  const userInfo = await userModel
    .findOne({ email: req.user.email })
    .populate("posts");
  res.render("profile", { user: userInfo });
});

//posts
app.post("/post", isLoggedIn, async (req, res) => {
  let { content } = req.body;
  let user = await userModel.findOne({ email: req.user.email });
  const post = await postModel.create({
    content,
    user: user._id,
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

// likes
app.get("/likes/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  let userId = req.user.userId;
  let index = post.likes.indexOf(userId);
  console.log(index, "index");
  // console.log(req.user, "users");
  if (index === -1) {
    post.likes.push(userId);
  } else {
    post.likes.splice(index, 1);
  }
  await post.save();
  res.redirect("/profile");
});

function isLoggedIn(req, res, next) {
  if (req.cookies.token === "") {
    return res.redirect("/login");
  } else {
    const userData = jwt.verify(req.cookies.token, "shhh");
    req.user = userData;
  }
  next();
}

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
