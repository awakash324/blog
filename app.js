require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const homeStartingContent = "Joe Biden is the president-elect of USA";
const aboutContent = "Daily journal with past 6 days journal";
const contactContent = " Jadavpur, KOLKATA";
const app = express();
const mongoose= require('mongoose');
const db='blogdb';


const  session = require('express-session');
const passport= require('passport');
const passportLoacalMongoose = require('passport-local-mongoose');
const LocalStrategy = require('passport-local').Strategy; 

app.use(session({
  name: 'session-id',
  secret:"Our little secret",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-awakash:Awakash@1234@cluster0.fan0m.mongodb.net/test"+db ,{useNewUrlParser: true,useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);

const blogschema= new mongoose.Schema({
  title : String ,
 body: String 
});
const userSchema= new mongoose.Schema({
  Email : String,
  active: Boolean
});

userSchema.plugin(passportLoacalMongoose);
const Blog= mongoose.model("Blog",blogschema);
const User= mongoose.model("User",userSchema);
passport.use(User.createStrategy());
// requires the model with Passport-Local Mongoose plugged in
 
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.post("/log",function(req,res){
  res.render("login");
})
  
  app.post("/signreg",function(req,res){
  res.render("register");
})
app.post('/login', passport.authenticate('local'), (req, res) => {
  User.findOne({
    username: req.body.username
  }, (err, person) => {
    if(err){
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        err: err
    }
      )}
    else{
   res.statusCode = 200;
    res.render("compose");
    }
   })
});
app.get("/settings",function(req,res){
 app.findOne('')
})
app.get('/logout', (req, res, next) => {
  
  if (req.session && req.isAuthenticated()) {
    req.logout();
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.clearCookie('session-id');
     res.redirect('/');
      }
    });
  } else {
    var err = new Error('You are not logged in!');
    err.status = 403;
   // next(err);
    res.render("signin");
  }
});

app.post('/register', (req, res, next) => {
  User.register(new User({
      username: req.body.username
    }),
    req.body.password, (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          err: err
        });
      } else {
        passport.authenticate('local')(req, res, () => {
          User.findOne({
            username: req.body.username
          }, (err, person) => {
            res.statusCode = 200;
           res.render("compose");
          });
        })
      }
    })
  })


 app.get("/",function(req,res){
  
    Blog.find({}, (err, posts) => {
      console.log("congrats")
        res.render("home", {
          homeStartingContent: homeStartingContent,
          posts: posts
        });
      })
  });
 
 app.post("/compose", function(req,res){
   if(req.isAuthenticated()){
     console.log(req.isAuthenticated())
  const post= new Blog({
    title :req.body.postTitle,
    body: req.body.postBody
 });
 post.save(function(err){
if (!err){
  res.redirect("/");
}
 });
   }
   else {
      res.render("signin");}
    });
   
app.get("/delete/:_id",function(req,res){
  if(req.isAuthenticated()){
  var x=req.params._id;
  Blog.deleteOne({ _id: x }, function (err) {
    if (err) return handleError(err);
    
    });
    res.redirect("/");}
    else{
      res.render("signin");
    }
});
 app.get("/about",function(req,res){
    res.render("about",{aboutContent: aboutContent});
});
app.get("/contact",function(req,res){
    res.render("contact",{contactContent: contactContent});
});
app.get("/compose" , function(req,res){
  if(req.isAuthenticated()){
    res.render("compose");
}
else
    res.render("signin");
});
app.get("/post/:postid",function(req,res){
    var requestedid= req.params.postid ;
    
Blog.findOne({_id : requestedid },function(err,post){
      if(!err){
        res.render("post",{
            Title : post,
            Body : post 
        } );
    }
        else console.log("not found");
      })
    });

let port= process.env.PORT || 3000
 app.listen(port);

function newFunction() {
  console.log("succeddd");
}

