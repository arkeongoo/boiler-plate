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
userSchema.methods.generateToken = async function () {
  let user = this;
  // //jsonwebtoken으로 token 생성하기

  let token = jwt.sign(user._id.toHexString(), "secretToken");
  user.token = token;
  await user.save();
  return token;
  // user.save(function (err, user) {
  //   if (err) return cb(err);
  //   cb(null, user);
  // });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
