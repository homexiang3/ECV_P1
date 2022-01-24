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
		document.querySelector(".login-wrapper").style.display = "none";
		document.querySelector(".grid-wrapper").style.display = 'block';
		document.querySelector(".own-info").innerHTML = username;
		userinput.value = "";
		chatinput.value = "";
	}
};

document.querySelector("#exit-chat-button").onclick = function(){
	username = null;
	room_name = null;	
	document.querySelector(".grid-wrapper").style.display = 'none';
	document.querySelector(".login-wrapper").style.display = "flex";

};
/*server.connect("wss://ecv-etic.upf.edu/node/9000/ws","CHAT");

server.on_connect = function(){  
	console.log("Connected to server! :)");  
}

server.on_message = function( user_id, message ){
   console.log( "User " + user_id + " said " + message );
   server.sendMessage("Hello from client!"); //example to send data to all 
}

server.on_user_connected = function(user_id){  
	console.log("Somebody has connected to the room");
}

server.on_user_disconnected = function(user_id){  
	console.log("Somebody has disconnected from the room");
}

server.on_close = function(){  
	console.log("Server closed the connection" );
}*/
