const express = require("express"),
  indexRouter = require("./routes/index"),
  fileRouter = require("./routes/fileUpload"),
  app = express(),
  busboy = require("connect-busboy"),
  path = require("path"),
  mongoose = require("mongoose"),
  { MONGODB_URI } = require("../config.json");

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => console.log(err));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(busboy());
app.use("/", indexRouter);
app.use("/import", fileRouter);

app.listen(3000);
console.log("Listening on port 3000");
