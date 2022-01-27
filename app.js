require('dotenv').config(); //make sure this line is always at the very top
const express = require("express");
const https = require("https");
const app = express();
//const encrypt = require("mongoose-encryption"); enables encryption plugin


const ejs = require("ejs");
const mongoose = require('mongoose');
const md5 = require("md5");

app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs');

//Database Connection and Schema
mongoose.connect("mongodb://localhost:27017/UserDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});



//userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});    //this line is for enabling encryption 

const User = new mongoose.model("User", userSchema);

//ROUTING STARTS HERE//
app.route("/")
.get(function(req,res){
  res.render('home');
  console.log("Steaming Stinky nutz.");
})
.post(function(req,res){

});



app.route("/login")
.get(function(req,res){
  res.render('login');
})
.post(function(req,res){
  const username = req.body.username;
  const password = md5(req.body.password);
  User.findOne({email: username}, function(err, foundUser){
    if(err)
    {
      console.log(err);
      
    }
    else if(foundUser)
      {
        if(foundUser.password === password)
        {
          res.render('secrets');
        }
      }
    
    else
    {
      console.log("no such user exists " + username);
    }
  });
  
});



app.route("/register")
.get(function(req,res){
  res.render('register');
})
.post(function(req,res){
  const newUser = new User({
    email: req.body.username,
    password: md5(req.body.password) 
  });

  newUser.save(function(err){
    if(err)
    {
      console.log(err);
    }
    else
    {
      res.render("secrets");
    }
  });
});
//END OF ROUTING//


app.listen(3030, function() {
    console.log("Server started on port 3030");
  });