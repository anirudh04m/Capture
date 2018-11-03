var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var app = express();

var mysql = require('mysql');


mongoose.connect("mongodb://localhost:27017/capture_app",{ useNewUrlParser: true });

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

var commentSchema = mongoose.Schema({
    text: String
});   
   
var Comment =mongoose.model("Comment", commentSchema);

var photoSchema = new mongoose.Schema({
    title:   String,
    image:   String,
    created: {type: Date , default: Date.now},
    comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

var Photo =mongoose.model("Photo", photoSchema);

app.get("/", function(req, res) {
    res.render("landing");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});


app.get("/capture", function(req, res){
    Photo.find({},function(err, photos){
        if(err){
            console.log(err);
        } else {
            res.render("index", {photos: photos});
        }
    });
    
});

app.get("/photos/new", function(req, res) {
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

app.get("/capture/:id",function(req, res) {
    Photo.findById(req.params.id).exec(function(err,foundPhoto){
        if(err){
            console.log(err);
        }     else {
            res.render("show",{photo: foundPhoto});
        }
    });
});


app.post("/register",function(req, res){
   var users={
    "name":req.body.nm,
    "uname":req.body.uname,
    "password":req.body.pwd
       
   };
   
   //Comments Create
app.post("/capture/:id",function(req, res){
   Photo.findById(req.params.id, function(err, photo){
       if(err){
           console.log(err);
           res.redirect("/capture");
       } else {
        Comment.create(req.body.comment, function(err, comment){
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
   
    connection.query('INSERT INTO users SET ?',users, function (error, results, fields) {
  if (error) {
    console.log("error ocurred",error);
    res.redirect("/register");
  }else{
    res.redirect("/login");
  }
  });
  
});


app.post("/login",function(req, res){

app.locals.hello = req.body.uname ;
    var pwd = req.body.pwd;
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
  });
  
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



app.listen(process.env.PORT,process.env.IP,function(){
   console.log("Server has started!"); 
});