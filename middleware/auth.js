const { User } = require("../models/User");

let auth = async (req, res, next) => {
  try {
    console.log("Cookies in request:", req.cookies); // 🔥 쿠키 로그 확인

    //클라이언트 쿠키에서 토큰을 가져옴
    let token = await req.cookies.x_auth;

    // if (!token) {
    //   return res
    //     .status(401)
    //     .json({ isAuth: false, message: "No token provided" });
    // }
    // console.log("Token received from cookies:", token); // 🔥 디버깅

    //토큰을 복호화한 후 유저를 찾음
    const user = await User.findByToken(token);

    //유저가 없으면 인증 실패
    if (!user) return res.json({ isAuth: false, error: true });

    //유저가 있으면 인증 완료
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = { auth };
