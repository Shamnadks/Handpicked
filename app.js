require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser")
const path = require("path");
const logger = require("morgan");
const session = require("express-session")
mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB database');
});


const app = express();

app.set('view engine','ejs');
app.set('views', './views');
app.use(express.static('public'));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(function (req, res, next) {
  res.header('Cache-control', 'no-cache, no-store');
  next();
});

app.use(session({ secret: process.env.SESSIONSECRET, resave: true, saveUninitialized: true, cookie: { maxAge: 600000 } }));

const userRoute = require("./routes/userRoute");
app.use(userRoute);
const adminRoute = require("./routes/adminRoute");
const { notFound, errorHandler } = require('./middleware/errorHandling');
app.use(adminRoute);


app.use('*',notFound);
app.use(errorHandler);

app.listen(3000, function () {
  console.log("server is running on port 3000..");
})




