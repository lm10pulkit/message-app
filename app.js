const express     = require('express');
const bodyparser  = require('body-parser');
const cookieparser= require('cookie-parser');
const session     = require('express-session');
const passport = require('passport');
var strategy = require('passport-local').Strategy;
var {hash,compare}= require('./hashing.js');
var {save,finduser,find,create,allmessage,deletemessage,deleteaccount}= require('./db.js');
// express app
 var app= express();
 //exsisting user
 var exsisting = function(req,res,next){
         console.log(req.query.name);
    finduser(req.query.name,function(err,docs){
         console.log(docs);
         if(docs)
          next();
        else
        res.redirect('/chatroom');
    });
 };
 //not logged in
 var notloggedin= function(req,res,next){
   
   if(req.user)
   	res.redirect('/chatroom');
   else
   	next();
 };
 //loggedin 
 var loggedin= function(req,res,next){

  if(req.user)
  	next();
  else
  	res.redirect('/login');
 };
//middle register
var middleregister= function(req,res,next){
   hash(req.body.password,function(err,hash){
    if(err)
    	res.redirect('/register');
    else{
    	req.body.password=hash;
    	next();
    }
   });
}
// setting template engine
app.set('view engine','hbs');
//for forms
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
// middleware for cookie parser

app.use(cookieparser());

//middleware for session
app.use(session(
	{
		secret:'secret',
	    saveUninitialized:true,
		resave:true
	}));
//middleware for passport
app.use(passport.initialize());
app.use(passport.session());
//welcome app
app.get('/',function(req,res){
res.send('welcome to our chat app');
});
//register route
app.get('/register',notloggedin,function(req,res){
res.render('register',{title:'register'});
});
// login route
app.get('/login',notloggedin,function(req,res){
res.render('register',{title:'login'});
});
//registering 
app.post('/register',middleregister,function(req,res){
     save(req.body);
     res.send('registered');
});
//setting up local strategy
passport.use(
	new strategy(function(username,password, done )
	{
      finduser(username,function(err,user){
        if(err)
        	throw err;
        if(!user)
        	return done(err,false);
         console.log(user);
        compare(password,user.password,function(err,match){
          if(err)
          	throw err;
          if(match)
           return   	done(null,user);
          else
          	return done(null,false);
        });
      });
}));
//serializing user
passport.serializeUser(function(user,done){
 done(null,user.username);
});
// deserializing user
passport.deserializeUser(function(username,done){
	finduser(username,function(err,user){
     done(err,user);
	});
});
//login
app.post('/login',passport.authenticate('local',{failureRedirect:'/login'}),function(req,res)
{
  res.redirect('/chatroom');
});
//chatoptions
app.get('/chatroom',loggedin,function(req,res){
  find(function(err,data){
     console.log(err);
    console.log(data);
     res.render('login', {list:data});	
  });
});
//chatpage
app.get('/chatpage',[loggedin,exsisting],function(req,res){
   allmessage(req.user.username,req.query.name).then(function(docs){
   	console.log(docs);
   	res.render('message',{messages:docs,to:req.query.name});
   },function(err){
   	console.log(err);
   });
});

// developing a message
app.post('/createmessage',loggedin,function(req,res){
	create(req.user.username,req.query.to,req.body.text);
	res.redirect('/chatpage?name='+req.query.to);
});
//deleting messages for all
app.post('/deletemessage',loggedin,function(req,res){
   deletemessage(req.user.username,req.query.to);
   res.redirect('/chatpage?name='+req.query.to);
});

//logout route
app.get('/logout',loggedin,function(req,res)
{
     req.logout();
     res.redirect('/login');  
});
//deleting a account
app.get('/delete',loggedin,function(req,res){
     var username= req.user.username;
     req.logout();
     deleteaccount(username);
     res.redirect('/login');
});
//connection to the server
app.listen(8080,function(err)
{
	if(err)
		console.log('cant connect to the server');
	else
		console.log('connected to the server');

});
