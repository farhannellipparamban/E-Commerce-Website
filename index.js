const config = require("./config/config");
const nocache = require("nocache");
const express = require("express");

config.mongooseConnect()

const app = express();

//nocache
app.use(nocache());

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//for user routes
const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

//for admin routes
const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);

const port = process.env.PORT || 3000; 

app.listen(port, () => {
  console.log("server is running....http://localhost:3000");
});
