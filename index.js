const express = require("express");
const app = express();
const port = 5000;
// const bodyParser = require("body-parser");
const { User } = require("./models/User");
const config = require("./config/key");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
