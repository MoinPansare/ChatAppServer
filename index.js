

var app = require('express')();
var server = require('http').createServer(app);
var connect = require('connect');
var bodyparser = require('body-parser');
var io = require('socket.io')(server);
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' });
var fs = require('fs');
var im = require('imagemagick');



// app.use(express.static(__dirname + '/public'));
// app.use(connect.cookieParser());
// app.use(connect.logger('dev'));
// app.use(connect.bodyParser());
// app.use(connect.json());
// app.use(connect.urlencoded());
app.use(bodyparser.urlencoded({extended : true}));
app.use(bodyparser.json());

// require('./routes/uploadFile.js');
//
// app.get('/', function(req, res){
//   res.sendFile(__dirname+'/index.html');
// });

app.post('/upload1', upload.single('image'), function (req, res, next) {
  // req.file is the `avatar` file
  console.log(req.file);
  // fs.readFile(req.file,function(err,data){
    var dirname = "/Users/macpro/Desktop/Node/ChatApp/images";
    var newPath = dirname + "/uploads/" +   req.file.originalname;
    fs.writeFile(newPath,req.file,function(err){
      if(err){
        console.log("error");
      res.json({'response':"Error"});
    }else{
      res.json({'response':"Success"});
    }
    });
  // });
  // req.body will hold the text fields, if there were any
})

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

      // sendNotification();

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

app.get('/info', function(req, res){
	console.log(__dirname);
	res.send("ok");
});

app.post('/upload', function(req, res){
	console.log("Received file:\n" + JSON.stringify(req.files));

	var photoDir = __dirname+"/photos/";
	var thumbnailsDir = __dirname+"/photos/thumbnails/";
	var photoName = req.files.source.name;

	fs.rename(
		req.files.source.path,
		photoDir+photoName,
		function(err){
			if(err != null){
				console.log(err)
				res.send({error:"Server Writting No Good"});
			} else {
				im.resize(
					{
						srcData:fs.readFileSync(photoDir+photoName, 'binary'),
						width:256
					},
					function(err, stdout, stderr){
						if(err != null){
							console.log('stdout : '+stdout)


							res.send({error:"Resizeing No Good"});
						} else {
							//console.log('ELSE stdout : '+stdout)
							fs.writeFileSync(thumbnailsDir+"thumb_"+photoName, stdout, 'binary');
							res.send("Ok");
						}
					}
				);
			}
		}
	);
});


function sendNotification() {
  var gcm = require('node-gcm');

  var message = new gcm.Message({
      data: { message: 'msg1' }
    });

    var sender = new gcm.Sender('AIzaSyCOD9PHlCIlVRve_AVLE_bO-SttsD1GbZk');
var regTokens = ['duKZbsaYsIc:APA91bHdfJe0j1dyGtBRrG6iJNoond_XlrpKQdjcrh3Wr46TkieJxWT5fx6ImNc6ncET8znQ66EPliM9SePZOS2iUNrO6e7RhD1ftb3GALPi00xKnEr-e0ESeMp0yOoLbPFSlTiJalpj'];

sender.send(message, { registrationTokens: regTokens }, function (err, response) {
    if(err) console.error(err);
    else 	console.log(response);
});
}
