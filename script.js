var server = new SillyClient(); //create our class
var username = null;
var room_name = null;
var my_id = null;

var userinput = document.querySelector("#main-username");
var chatinput = document.querySelector("#main-chatroom");
//Enter chat function
document.querySelector("#enter-chat-button").onclick = function(){
	
	if(userinput.value != "" && chatinput.value != ""){
		username = userinput.value;
		room_name = chatinput.value;
		server.connect("wss://tamats.com:55000","scroll4u-"+room_name);//wss://ecv-etic.upf.edu/node/9000/ws
	}
};

//this method is called when the server accepts the connection (no ID yet nor info about the room)
server.on_connect = function(){  

	console.log("Connected to server on room: "+room_name);  
	//create contact tab / info
	var contact = document.createElement("div");
	contact.className = "contact";
	contact.innerHTML = room_name;
	document.querySelector(".contacts-list").appendChild(contact);

	document.querySelector(".contact-info").innerHTML = room_name;
	//open chat
	document.querySelector(".login-wrapper").style.display = "none";
	document.querySelector(".grid-wrapper").style.display = 'block';
	document.querySelector(".own-info").innerHTML = username;
	userinput.value = "";
	chatinput.value = "";
}

//add mesage function
var message_input = document.querySelector("#send-message");
var send_button = document.querySelector(".send-button");

function messageToDOM(msg, msgwrap, msgcontentwrap, name){

	var chat = document.querySelector(".public-room");

	var message = document.createElement("div");
	message.className = "msg";

	var usernamewrapper = document.createElement("div");
	usernamewrapper.className = msgwrap;

	var user = document.createElement("div");
	user.className = "msg-username";
	user.innerHTML = name;	

	usernamewrapper.appendChild(user);
	message.appendChild(usernamewrapper);


	var messagewrapper = document.createElement("div");
	messagewrapper.className = msgwrap;

	var content = document.createElement("div");
	content.classList.add("msg-content", msgcontentwrap);
	content.innerHTML = msg;
	messagewrapper.appendChild(content);

	message.appendChild(messagewrapper);

	chat.appendChild(message);
	chat.scrollTop = 100000;
}

function addMessage(msg)
{
	messageToDOM(msg, "msg-right", "msg-content-right",username);
	
	var mymessage = {
		type: "text",
		username: username,
		content: msg
	};

	server.sendMessage(JSON.stringify(mymessage));
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



//this method is called when the server gives the user his ID (ready to start transmiting)
server.on_ready = function(id){
	my_id = id;
  };
/*this method is called when we receive the info about the current state of the room (clients connected)
server.on_room_info = function(info){
	console.log(info);
}*/
//this methods receives messages from other users (author_id is an unique identifier per user)
server.on_message = function( user_id, message ){
   var msg = JSON.parse( message );
   if(msg.type == "text"){
   console.log( "User " + user_id + " said " + msg.content );
   messageToDOM(msg.content, "msg-left", "msg-content-left",msg.username); 
   }else if(msg.type == "history"){
	   msg.content.forEach(function(m){
		messageToDOM(m.content, "msg-left", "msg-content-left",m.username); 
	   });
   }
}
//this methods is called when a new user is connected
server.on_user_connected = function(user_id){  
	console.log("User "+user_id+" has connected to the room");
	var room_ids = Object.keys(server.clients);
	//send all your logs to the new user if you're the first user in the chatroom
	if(my_id == Math.min(...room_ids)){
		var public_room = document.querySelector(".public-room");
		var msgs = public_room.querySelectorAll('.msg');
		var content = [];
		msgs.forEach(function(msg) {
			var username = msg.querySelector(".msg-username").innerText;
			var msg_content = msg.querySelector(".msg-content").innerText;
			var info = {
				type: "text",
				username: username,
				content: msg_content
			}
			content.push(info);	
		  });

		var logs = {
			type: "history",
			content: content
		};
		server.sendMessage(JSON.stringify(logs),user_id);
	}
}
//this methods is called when a user leaves the room
server.on_user_disconnected = function(user_id){  
	console.log("User "+user_id+" has disconnected to the room");
}
//this methods is called when the server gets closed (it shutdowns)
server.on_close = function(){  
	console.log("Server closed the connection" );
	document.querySelector(".login-wrapper").style.display = "flex";
	document.querySelector(".grid-wrapper").style.display = 'none';
}
/*this method is called when coulndt connect to the server
server.on_error = function(err){
	console.log(err);
};*/

//all room server.sendMessage("mymessage");
//private server.sendMessage("mymessage", [1,4,7]);
//info opened rooms server.getReport( function(report) { ... } );
//info about one specific room server.getRoomInfo( "myroom", function(room_info) { ... } );
/*You can store information in the server so future users could retrieve it even if you are offline:

server.storeData("mykey", "mydata");
//...
server.loadData("mykey", function(data) { console.log(data); }); //should print mydata*/