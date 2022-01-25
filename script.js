var server = new SillyClient(); //create our class
var username = null;
var room_name = null;
//Enter chat function
document.querySelector("#enter-chat-button").onclick = function(){
	var userinput = document.querySelector("#main-username");
	var chatinput = document.querySelector("#main-chatroom");
	if(userinput.value != "" && chatinput.value != ""){
		username = userinput.value;
		room_name = chatinput.value;
		server.connect("wss://ecv-etic.upf.edu/node/9000/ws","scroll4u-"+room_name);
		document.querySelector(".login-wrapper").style.display = "none";
		document.querySelector(".grid-wrapper").style.display = 'block';
		document.querySelector(".own-info").innerHTML = username;
		userinput.value = "";
		chatinput.value = "";
	}
};

//add mesage function
var chat = document.querySelector(".chat");
var message_input = document.querySelector("#send-message");
var send_button = document.querySelector(".send-button");

function messageToDOM(msg, msgwrap, msgcontentwrap, name=null){

	var message = document.createElement("div");
	message.className = "msg";

	if(name != null){
	var usernamewrapper = document.createElement("div");
	usernamewrapper.className = msgwrap;

	var user = document.createElement("div");
	user.className = "msg-username";
	user.innerHTML = name;	

	usernamewrapper.appendChild(user);
	message.appendChild(usernamewrapper);
	}

	var messagewrapper = document.createElement("div");
	messagewrapper.className = msgwrap;

	var content = document.createElement("div");
	content.className = msgcontentwrap;
	content.innerHTML = msg;
	messagewrapper.appendChild(content);

	var timediv = document.createElement("div");
	timediv.className = msgwrap;
	var timediv2 = document.createElement("div");
	timediv2.className = "msg-time";
	var today = new Date();
	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	timediv2.innerHTML = time;
	timediv.appendChild(timediv2);


	message.appendChild(messagewrapper);
	message.appendChild(timediv);


	chat.appendChild(message);
	chat.scrollTop = 100000;
}

function addMessage(msg)
{
	messageToDOM(msg, "msg-right", "msg-content-right");
	
	var mymessage = {
		type: "text",
		username: username,
		content: msg
	}
	var mymessage_str = JSON.stringify(mymessage);
	server.sendMessage(mymessage_str);
	console.log(mymessage);
	message_input.value = "";
}

function onKeyPress(e)
{
	if(e.code == "Enter")
	{
		addMessage(message_input.value);
}
}
send_button.addEventListener("click",function(){addMessage(message_input.value);},false);
message_input.addEventListener("keydown", onKeyPress );


//this method is called when the server accepts the connection (no ID yet nor info about the room)
server.on_connect = function(){  
	console.log("Connected to server on room: "+room_name);  
}
//this method is called when the server gives the user his ID (ready to start transmiting)
server.on_ready = function(id){
	//user has an ID
  };
/*this method is called when we receive the info about the current state of the room (clients connected)
server.on_room_info = function(info){
	console.log(info);
}*/
//this methods receives messages from other users (author_id is an unique identifier per user)
server.on_message = function( user_id, message ){
   var msg = JSON.parse( message );
   console.log( "User " + user_id + " said " + msg );
   messageToDOM(msg.content, "msg-left", "msg-content-left",msg.username); 
}
//this methods is called when a new user is connected
server.on_user_connected = function(user_id){  
	console.log("Somebody has connected to the room");
}
//this methods is called when a user leaves the room
server.on_user_disconnected = function(user_id){  
	console.log("Somebody has disconnected from the room");
}
//this methods is called when the server gets closed (it shutdowns)
server.on_close = function(){  
	console.log("Server closed the connection" );
}
//this method is called when coulndt connect to the server
server.on_error = function(err){
};
//all room server.sendMessage("mymessage");
//private server.sendMessage("mymessage", [1,4,7]);
//info opened rooms server.getReport( function(report) { ... } );
//info about one specific room server.getRoomInfo( "myroom", function(room_info) { ... } );
/*You can store information in the server so future users could retrieve it even if you are offline:

server.storeData("mykey", "mydata");
//...
server.loadData("mykey", function(data) { console.log(data); }); //should print mydata*/