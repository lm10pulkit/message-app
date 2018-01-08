var createmessage= function(from ,to, text){
   return {
   	from,
   	to,
   	text,
   	time:new Date().getTime()
   };
};
module.exports={
	createmessage
};