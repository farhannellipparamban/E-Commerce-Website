// const sessionSecret = "mysitesessionsecret";
require ("dotenv").config()
const sessionSecret = process.env.SESSION_SECRET
const mongoose = require("mongoose");

const mongooseConnect = () => {
  mongoose
    .connect("mongodb+srv://anufarhan111:F8l69NfMepg3zn1H@cluster0.q6aomli.mongodb.net/watch_palace")
    .then(() => {
      console.log("database Connected");
    })
    .catch((error) => {
      console.log(error);
    });
};

module.exports = {
  sessionSecret,
  mongooseConnect,
};
