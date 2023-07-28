const sessionSecret = "mysitesessionsecret";
const mongoose = require("mongoose")

const mongooseConnect = ()=>{
  mongoose.connect("mongodb://127.0.0.1:27017/watch_palace")
  .then(()=>{
    console.log("database Connected");
  }).catch((error)=>{
    console.log(error);
  })
}


module.exports = {
  sessionSecret,
  mongooseConnect,
};
