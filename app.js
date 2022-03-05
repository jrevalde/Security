require('dotenv').config(); //make sure this line is always at the very top
const express = require("express");
const https = require("https");

//const encrypt = require("mongoose-encryption"); enables encryption plugin


const ejs = require("ejs");
const mongoose = require('mongoose');
//const md5 = require("md5");
//const bcrypt = require('bcrypt'); 
//const saltRounds = 10;
var session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const { rmSync } = require('fs');
const { allowedNodeEnvironmentFlags } = require('process');
const { resetWatchers } = require('nodemon/lib/monitor/watch');
//const { serializeUser, deserializeUser } = require('passport');

const app = express();

app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs');


app.use(session({
  secret: "Our little secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
//Database Connection and Schema
mongoose.connect("mongodb://localhost:27017/UserDB");


const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

//userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});    //this line is for enabling encryption 

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3030/auth/google/secrets"
  //userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));




//ROUTING STARTS HERE//
app.route("/")
.get(function(req,res){
  res.render('home');
  console.log("Steaming Stinky nutz.");
})
.post(function(req,res){

});


app.route("/auth/google")
.get(function(req, res){
  passport.authenticate("google", {scope: ['profile'] });
})
.post(function(req,res){

});



app.route("/login")
.get(function(req,res){
  res.render('login');
})
.post(function(req,res){
  
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err)
    {
      console.log(err);
    }
    else
    {
      passport.authenticate("local")(req,res, function(){
        res.redirect("/secrets");
      });
    }
  });
});

app.route("/secrets")
.get(function(req, res){

  if(req.isAuthenticated())
  {
    res.render("secrets");
  }
  else
  {
    res.redirect("/login");
  }
})
.post(function(req, res){
  
});

app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});



app.route("/register")
.get(function(req,res){
  res.render('register');
})
.post(function(req,res){
  
    User.register({username: req.body.username}, req.body.password, function(err, user){
      if(err)
      {
        console.log(err);
        res.redirect("/register");
      }
      else
      {
        passport.authenticate("local")(req,res, function(){
          res.redirect("/secrets");
        });
      }
    });
});
//END OF ROUTING//


app.listen(3030, function() {
    console.log("Server started on port 3030");
  });