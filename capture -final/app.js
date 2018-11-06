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

/*connection.connect(function(err){
if(!err) {
    console.log("Database is connected");
} else {
    console.log("Error connecting database");
}
});

var FollowSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
      
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  }]
}
);

var Follow = mongoose.model("Follow",FollowSchema);*/

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    uploads : [
          {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Photo"
      }
   ]
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


app.get("/capture/:id/uploads",isLoggedIn, function(req, res){
    app.locals.un = req.user.username ;
    app.locals.id = req.user._id;
    User.findById(req.params.id).populate("uploads").exec(function(err, user){
        if(err){
            console.log(err);
        } else {
            res.render("index", {user: user});
        }
    });
    
    
});

app.get("/photos/new",isLoggedIn, function(req, res) {
    res.render("new");
});

app.post("/capture/:id/uploads",function(req, res){
   /*Photo.create(req.body.photo, function(err, newPhoto){
      if(err){
          res.render("new");
      } else {
          res.redirect("/capture");
      } 
    }); */
    
    User.findById(req.params.id, function(err, user){
       if(err){
           console.log(err);
           res.redirect("/capture"+user._id+"/uploads");
       } else {
        Photo.create(req.body.photo, function(err, photo){
           if(err){
               console.log(err);
           } else {
               //save comment
               photo.save();
               user.uploads.push(photo);
               user.save();
               console.log(photo);
               res.redirect("/capture/"+user._id+"/uploads");
           }
        });
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
           res.redirect("/capture"+req.user._id+"/uploads");
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
    failureRedirect: "/login"
}),function(req, res){
    res.redirect("/capture/"+req.user._id+"/uploads");

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

/*app.delete("/capture/:id", function(req, res){
    Photo.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/capture/"+req.user._id+"/uploads");
        } else {
            res.redirect("/capture/"+req.user._id+"/uploads");
        }
    });
}); */

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


app.get("/capture/:id/users",isLoggedIn,function(req, res) {
    User.find({},function(err, foundUsers){
       if(err){
           res.redirect("/capture/"+req.user._id+"/uploads");
       } else {
           res.render("users",{users:foundUsers}); 
       }
    });
   
});


/*app.post("/capture/:id/users",function(req, res) {
        const user_id = req.params._id;
    const to_follow_id = req.body.follow_id;
 
    let bulk = Follow.collection.initializeUnorderedBulkOp();
 
    bulk.find({ 'user': mongoose.Types.ObjectId(user_id) }).upsert().updateOne({
        $addToSet: {
            following: mongoose.Types.ObjectId(to_follow_id)
        }
    });
 
    bulk.find({ 'user': mongoose.Types.ObjectId(to_follow_id) }).upsert().updateOne({
        $addToSet: {
            followers: mongoose.Types.ObjectId(user_id)
        }
    });
 
    bulk.execute(function(err, doc) {
        if (err) {
            res.send(err);
            
        } else {
        res.redirect("/capture/"+user_id+"/uploads");
        }
        }); 
    }); */
    
    app.get("/photos/all",isLoggedIn,function(req, res) {
        app.locals.un = req.user.username ;
    app.locals.id = req.user._id;
        Photo.find({},function(err, photos){
        if(err){
            console.log(err);
        } else {
            res.render("logPosts", {photos: photos});
        }
    });
    });
        
    app.get("/allposts",function(req, res) {
        Photo.find({},function(err, photos){
        if(err){
            console.log(err);
        } else {
            res.render("allPosts", {photos: photos});
        }
    });
    })

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