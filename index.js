const express = require("express");
const app = express();
const port = 5000;
// const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("./config/key");
const { User } = require("./models/User");
const { auth } = require("./middleware/auth");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post("/api/users/login", async (req, res) => {
  try {
    //요청된 이메일 데이터베이스에서 찾기
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.json({ loginSuccess: false, message: "User not found" });

    // console.log("User found:", user); // 🔥 user 객체 확인
    // console.log("comparePassword exists:", typeof user.comparePassword);

    //요청된 이메일이 데이터베이스에 있다면 비밀번호 맞는지 확인하기
    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch)
      return res.json({
        loginSuccess: false,
        message: "Password is incorrect",
      });
    //비밀번호까지 맞다면 토큰 생성
    const token = await user.generateToken();
    res
      .cookie("x_auth", token)
      .status(200)
      .json({ loginSuccess: true, userId: user._id });
  } catch (error) {
    return res.status(400).json({ loginSuccess: false, error: error.message });
  }
});

app.get("/api/users/auth", auth, (req, res) => {
  //여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True임.
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get("/api/users/logout", auth, async (req, res) => {
  try {
    await User.findOneAndUpdate({ _id: req.user._id }, { token: "" });
    return res.status(200).send({ success: true });
  } catch (error) {
    return res.json({ success: false, error });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
