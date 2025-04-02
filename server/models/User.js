const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 30,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 30,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

userSchema.pre("save", function (next) {
  let user = this;

  if (user.isModified("password")) {
    // password 암호화
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = async function (plainPassword) {
  //plainpassword 12345..
  return bcrypt.compare(plainPassword, this.password);
  // bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
  //   if (err) return cb(err);
  //   cb(null, isMatch);
  // });
};
userSchema.methods.generateToken = function () {
  try {
    let user = this;
    //jsonwebtoken으로 token 생성하기
    // token === user._id + "secretToken"
    // 위의 token을 디코드 시킬 때 "secretToken을 넣으면 user._id를 줌"
    let token = jwt.sign(user._id.toHexString(), "secretToken");
    user.token = token;
    return user.save();
  } catch (error) {
    throw new Error("Error generating token " + error.message);
  }
};

userSchema.statics.findByToken = async function (token) {
  try {
    let user = this;
    //토큰을 디코드함
    const decoded = await jwt.verify(token, "secretToken");
    //유저 아이디 이용해서 유저 찾은 다음
    // 클라이언트에서 가져온 token과 DB에 보관된 token이 일치하는지 확인
    let userInfo = await user.findOne({ _id: decoded, token: token });
    return userInfo;
  } catch (error) {
    return null;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
