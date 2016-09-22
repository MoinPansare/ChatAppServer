

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});

var user = {
  UserName : "",
  id : "",
};

var userArray = [];

io.on('connection',function(socket){

    console.log('\none user connected '+socket.id);
    id = socket.id;

    socket.on('register',function(data){
      var myUser  = {
        UserName : data.UserName,
        socket : socket,
      };

      var present = false;
      for (var i = 0; i < userArray.length; i++) {
        var currentUser = userArray[i];
        if (currentUser.socket == myUser.socket) {
          present = true;
        }
      }
      if (!present) {
        userArray.push(myUser);
      }
      console.log("\n"+userArray);
    });


    socket.on('message',function(data){
      console.log(data.UserName + "from socket");
      console.log(userArray.length + "length");
      var index = -1;
      for (var i = 0; i < userArray.length; i++) {
        console.log(userArray[i].UserName);
        if (userArray[i].UserName == data.UserName) {
          index = i;
          break;
        }
      }
      console.log(index + " this is index");
      // console.log(userArray[index].userName + " this is username");
      for (var i = 0; i < userArray.length; i++) {
        if (i!=index) {
          userArray[i].socket.emit("message",{text : data.text});
        }
      }
    })



    socket.on('leave',function(data){
      console.log("leaving");
      var index = -1;

      for (var i = 0; i < userArray.length; i++) {
        if (userArray[i].UserName == data.UserName) {
          index = i;
          break;
        }
      }

      console.log("Arrray : " + userArray);

      if (index != -1) {
          var name = userArray[index].UserName;
          userArray.splice(index,1);
          console.info('Client gone (id=' + socket.id + ').');
          console.log("removed user , Name : " + name);
          console.log(userArray);
      }else{
        console.log("User Not found");
      }
    });


    socket.on('disconnect',function(){
        console.log('one user disconnected '+socket.id);
    })
});

server.listen(3000,function(){
  console.log("server started");
});
