const mongodb = require('mongodb');
const mongoose= require('mongoose');
mongoose.connect('mongodb://localhost/my_message_app');
var {createmessage}= require('./createmessage.js');
const schema = mongoose.Schema;
var userschema = new schema(
	{
		username :{
			type :String ,
			unique:true,
			required:true
		},
		password:{
			type:String ,
			required:true
		}
	});
var user = mongoose.model('user',userschema);
var messageschema = new schema({
	from :{
		type:String ,
		required:true 
	},
	to:{
		type:String ,
        required: true
	},
	text:{
	   type:String ,
        required: true	
	}
	,
	time:{
		type:Number,
		required:true
	}
});
var message = mongoose.model('message',messageschema);
var save= function(data){
 var newuser= new user(data);
 newuser.save().then(function(data){
 	console.log(data);

 },function(err){
 	console.log(err);
 });
};
var finduser= function(username,callback){
user.findOne({username:username},callback);
};
var find = function(callback){
user.find(callback);
};
var create= function(from,to,text){
var  mes=createmessage(from,to,text);
   var newmessage= new message(mes);
   newmessage.save().then(function(data){
   	console.log(data);
   },function(err){
   	console.log(err);
   });
};
var allmessage = function(from,to,callback){
	return message.find({$or: [{from:from, to:to},{from:to,to:from}]}).sort({time:1});
};
var deletemessage= function(from,to){
   message.remove({$or: [{from:from, to:to},{from:to,to:from}]}).then(function(data){
   	console.log(data);
   });
};
var deleteaccount=function(username){
	message.remove({$or: [{from:username},{to:username}]}).then(function(data){
         console.log(data);
	},function(err){
		console.log(err);
	});
	user.remove({username:username}).then(function(data){
		console.log(data);		
	},
	function(err){
		console.log(err);
	});
};

module.exports={
   save,finduser,find,create,allmessage,
   deletemessage,deleteaccount
};