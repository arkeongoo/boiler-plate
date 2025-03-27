const express = require("express");
const app = express();
const port = 5000;
// const bodyParser = require("body-parser");
const { User } = require("./models/User");
const config = require("./config/key");
const cookieParser = require("cookie-parser");

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
      .cookie("x-auth", token)
      .status(200)
      .json({ loginSuccess: true, userId: user._id });
  } catch (error) {
    return res.status(400).json({ loginSuccess: false, error: error.message });
  }
  // User.findOne({ email: req.body.email }, (err, user) => {
  //   if (!user) {
  //     return res.json({
  //       loginSuccess: false,
  //       message: "The user does not exist.",
  //     });
  //   }
  //
  //   user.comparePassword(req.body.password, (err, isMatch) => {
  //     if (!isMatch)
  //       return res.json({
  //         loginSuccess: false,
  //         message: "Password is incorrect",
  //       });
  //
  //     user.generateToken((err, user) => {
  //       if (err) return res.status(400).send(err);
  //       //토큰 저장 쿠키 or 로컬스토리지 and so on
  //       res
  //         .cookie("x-auth", user.token)
  //         .status(200)
  //         .json({ loginSuccess: true, userId: user._id });
  //     });
  //   });
  // });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
