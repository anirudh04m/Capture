var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var app = express();

var passport              = require("passport"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");

var mysql = require('mysql');


mongoose.connect("mongodb://localhost:27017/capture_app",{ useNewUrlParser: true });

app.use(require("express-session")({
    secret: "Hello World",
    resave: false,
    saveUninitialized: false
}));

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'project'
});

connection.connect(function(err){
if(!err) {
    console.log("Database is connected");
} else {
    console.log("Error connecting database");
}
});

var UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", UserSchema);



var commentSchema = mongoose.Schema({
    text: String
});   
   
var Comment =mongoose.model("Comment", commentSchema);

var photoSchema = new mongoose.Schema({
    title:   String,
    image:   String,
    created: {type: Date , default: Date.now},
    likes: {type: Number , default: 0},
    likeFlag : {type: String, default: "Like"},
    comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

var Photo =mongoose.model("Photo", photoSchema);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
    res.render("landing");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});


app.get("/capture",isLoggedIn, function(req, res){
    app.locals.un = req.user.username ;
    Photo.find({},function(err, photos){
        if(err){
            console.log(err);
        } else {
            res.render("index", {photos: photos});
        }
    });
    
});

app.get("/photos/new",isLoggedIn, function(req, res) {
    res.render("new");
});

app.post("/capture",function(req, res){
   Photo.create(req.body.photo, function(err, newPhoto){
      if(err){
          res.render("new");
      } else {
          res.redirect("/capture");
      } 
    }); 
});


app.get("/capture/:id/comments/new",isLoggedIn, function(req, res){
    // find campground by id
    console.log(req.params.id);
    Photo.findById(req.params.id, function(err, photo){
        if(err){
            console.log(err);
        } else {
             res.render("commnew", {photo: photo});
        }
    });
});


app.get("/capture/:id",isLoggedIn,function(req, res) {
    Photo.findById(req.params.id).populate("comments").exec(function(err,foundPhoto){
        if(err){
            console.log(err);
        }     else {
            res.render("show",{photo: foundPhoto});
        }
    });
});



   
   //Comments Create
app.post("/capture/:id/comments",function(req, res){
   Photo.findById(req.params.id, function(err, photo){
       if(err){
           console.log(err);
           res.redirect("/capture");
       } else {
        Comment.create({text: req.body.comment}, function(err, comment){
           if(err){
               console.log(err);
           } else {
               //save comment
               comment.save();
               photo.comments.push(comment);
               photo.save();
               console.log(comment);
               res.redirect('/capture/' + photo._id);
           }
        });
       }
   });
});
   
   app.post("/register",function(req, res){
   /*var users={
    "name":req.body.nm,
    "uname":req.body.uname,
    "password":req.body.pwd
       
   };
    connection.query('INSERT INTO users SET ?',users, function (error, results, fields) {
  if (error) {
    console.log("error ocurred",error);
    res.redirect("/register");
  }else{
    res.redirect("/login");
  }
  });*/
  
  User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register');
        } else {
            res.redirect("/login");
        }
       
    });
  
});


app.post("/login",passport.authenticate("local",{
    successRedirect: "/capture",
    failureRedirect: "/login"
}),function(req, res){

//app.locals.hello = req.body.username ;
   /* var pwd = req.body.pwd;
   connection.query("SELECT name,password FROM users where uname =  ?",[req.body.uname] , function (err, result, fields) {
    if(result.length >0){
    
    if (err){
       throw err;
    } 
    //console.log(result[0].password);
    if(result[0].password == pwd){
     res.redirect("/capture");
  }
  else {
      res.redirect("/login");
  }
  }
  else {
      res.redirect("/login");
  }
  }); */
  
});

app.delete("/capture/:id", function(req, res){
    Photo.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/capture");
        } else {
            res.redirect("/capture");
        }
    });
});

app.put("/capture/:id/like",function(req, res) {
    Photo.findByIdAndUpdate(req.params.id,{likes: parseInt(req.body.like,10),likeFlag: req.body.btn},function(err,updatedPhoto){
        if(err){
            console.log(err);
        }
        else {
            res.redirect("/capture/"+updatedPhoto._id);
        }
    });
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}



app.listen(process.env.PORT,process.env.IP,function(){
   console.log("Server has started!"); 
});