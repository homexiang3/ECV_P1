var server = new SillyClient(); //create our class
var username = null;
var room_name = null;
var my_id = null;
var users_list = [];
//var messages_list = [];
var private_rooms_list = [];

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
	contact.classList.add("contact","active-contact");
	contact.innerHTML = room_name;
	contact.setAttribute("chat",room_name+"-public-room")
	contact.addEventListener("click",clickContact);
	document.querySelector(".contacts-list").appendChild(contact);
	//create public room
	var public = document.createElement("div");
	public.className = "public-room";
	public.setAttribute("id",room_name+"-public-room");
	document.querySelector(".chat").appendChild(public);

	document.querySelector(".contact-info").innerHTML = room_name;
	//open chat
	document.querySelector(".login-wrapper").style.display = "none";
	document.querySelector(".grid-wrapper").style.display = 'block';
	document.querySelector(".own-info").innerHTML = username;
	userinput.value = "";
	chatinput.value = "";
}

//this method is called when the server gives the user his ID (ready to start transmiting)
server.on_ready = function(id){
	my_id = id;
	console.log("my id is: "+my_id);
  };

//DOM message vars
var message_input = document.querySelector("#send-message");
var send_button = document.querySelector(".send-button");

message_input.addEventListener("focus",typingFunction);
//typing..
function typingFunction(){

	var typing = {
		type: "typing",
		username: username,
	};
	server.sendMessage(JSON.stringify(typing));
	
}
//Put the message on the DOM with the corresponding style
function messageToDOM(msg, msgwrap, msgcontentwrap, name, id, chat){

	var message = document.createElement("div");
	message.className = "msg";

	var usernamewrapper = document.createElement("div");
	usernamewrapper.className = msgwrap;

	var user = document.createElement("div");
	user.className = "msg-username";
	user.setAttribute("user-id",id);
	user.innerHTML = name;	
	user.addEventListener("click",function(){
		createPrivateChat(id,name);
	});

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
//Send the message to the user
function addMessage(msg)
{
	var chat = document.querySelector(".active-contact").getAttribute("chat");
	chat = document.querySelector("#"+chat);
	//private or public messages
	var type = "text";

	if(chat.className == "private-room"){
		type = "private";
	}
	
	messageToDOM(msg, "msg-right", "msg-content-right",username,my_id,chat);
	var mymessage = {
		type: type,
		username: username,
		content: msg
	};

	server.sendMessage(JSON.stringify(mymessage));
	message_input.value = "";
}
//On enter or clicking the send button we sned the message
function onKeyPress(e)
{
	if(e.code == "Enter")
	{
		addMessage(message_input.value);
}
}
send_button.addEventListener("click",function(){addMessage(message_input.value);},false);
message_input.addEventListener("keydown", onKeyPress );

//Create a new contact tab and private chat when clicking on the username
function createPrivateChat(target_id,name){
	if(target_id!=my_id && !private_rooms_list.includes(target_id)){
		//add id to private room to avoid duplicates
		private_rooms_list.push(target_id);
		//create chat
		var chat = document.createElement("div");
		chat.className = "private-room";
		chat.setAttribute("id","u-"+target_id+"-room");
		document.querySelector(".chat").appendChild(chat);
		//create contact tab
		var contact = document.createElement("div");
		contact.className = "contact";
		contact.innerHTML = name;
		contact.setAttribute("chat","u-"+target_id+"-room")
		contact.addEventListener("click",clickContact);
		var elem = document.querySelector(".contacts-list").appendChild(contact);
		//focus on the newly created chat
		elem.click();
		
	}
}
//function when clicking on different contact tabs
function clickContact(){
	var previous = document.querySelector(".active-contact");
	previous.classList.remove("active-contact");
	this.classList.add("active-contact");
	var target_chat = this.getAttribute("chat")
	showCurrentChat(target_chat);
} 
//function that hides chats and shows the current one
function showCurrentChat(target_chat){
	var chat = document.querySelector(".chat");
	for(var i = 0;i < chat.childNodes.length;i++){
		if(target_chat != chat.childNodes[i].getAttribute("id")){
		chat.childNodes[i].style.display = "none";
		}else{
			chat.childNodes[i].style.display = "";
		}
	}
}


server.on_room_info = function(info){
	users_list = Object.values(info)[1];
}

//this methods receives messages from other users (author_id is an unique identifier per user)
server.on_message = function( user_id, message ){
   var msg = JSON.parse( message );
   var chat;
	//depending on msg type do different thinks
   if(msg.type == "text"){
   chat = document.querySelector(".public-room");
   messageToDOM(msg.content, "msg-left", "msg-content-left",msg.username,user_id,chat); 
   }else if(msg.type == "history"){
	   msg.content.forEach(function(m){
		chat = document.querySelector(".public-room");
		messageToDOM(m.content, "msg-left", "msg-content-left",m.username,m.id,chat); 
	   });
   }else if(msg.type == "typing"){
   }else if(msg.type =="private"){
	createPrivateChat(user_id,msg.username);
	chat = document.querySelector("#u-"+user_id+"-room");
	messageToDOM(msg.content, "msg-left", "msg-content-left",msg.username,user_id,chat); 
   }
}
//this methods is called when a new user is connected
server.on_user_connected = function(user_id){  
	users_list.push(user_id);
	console.log("User "+user_id+" has connected to the room");
	var room_ids = Object.keys(server.clients);
	//send all your logs to the new user if you're the first user in the chatroom
	if(my_id == Math.min(...room_ids)){
		var public_room = document.querySelector(".public-room");
		var msgs = public_room.querySelectorAll('.msg');
		var content = [];
		if(msgs.length > 0) {
			msgs.forEach(function(msg) {
				var username = msg.querySelector(".msg-username").innerText;
				var id = msg.querySelector(".msg-username").getAttribute("user-id");
				var msg_content = msg.querySelector(".msg-content").innerText;
				var info = {
					type: "text",
					username: username,
					id: id,
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
}
//this methods is called when a user leaves the room
server.on_user_disconnected = function(user_id){  
	var index = null;
	//delete user for the user list
	for(var i = 0; i < users_list.length; i++){
		if(user_id == users_list[i]){
			index = i;
		}
	}
	users_list.splice(index,1);
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

