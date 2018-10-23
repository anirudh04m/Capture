var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var app = express();
var mysql = require("mysql");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "andy040997",
  database: "project"
});

mongoose.connect("mongodb://localhost:27017/capture_app",{ useNewUrlParser: true });

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

var photoSchema = new mongoose.Schema({
    title:   String,
    image:   String,
    created: {type: Date , default: Date.now}
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "CREATE TABLE users (name VARCHAR(20),uname varchar(20) primary key, password VARCHAR(20))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});

var Photo =mongoose.model("Blog", photoSchema);

app.get("/", function(req, res) {
    res.redirect("/capture");
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

app.post("/blogs",function(req, res){
   Photo.create(req.body.blog, function(err, newBlog){
      if(err){
          res.render("new");
      } else {
          res.redirect("/capture");
      } 
    }); 
});


app.listen(process.env.PORT,process.env.IP,function(){
   console.log("Server has started!"); 
});