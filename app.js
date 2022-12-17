const express = require('express');
const session = require('express-session');
const { createUser } = require('./models/database.js');

const app = express();
const PORT = 8080; // port
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");

const routes = require('./routes/routes.js');

app.use(express.urlencoded()); // express will parse queries from the URL
app.use(express.static('static')); // express serves static resources from static folder
app.set('view engine', 'pug'); // set the rendering engine to pug
app.use(session({
  secret: 'nets2120projectgroup11',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 12 // 12 hours
  }
}));

/**
 * route = URL that will redirect to other URLs
 * get = URL that will respond with a rendered page
 * post = URL that will post data to database
 * json = URL that will respond with JSON data
 */
app.get('/', routes.getSplash);
app.get('/signup', routes.getSignUp);
app.get('/login', routes.getLogin);
app.get('/wall', routes.getWall);
app.get('/searchuser', routes.getSearchUser);
// app.get('/profile', null);
app.get('/settings', routes.getSettings);
app.get('/friends', routes.getFriends);
app.get('/mywall/:username', routes.getMyWall);

//kevin: visualizer routes call
app.get('/visualizer', routes.getVisualizer);

app.get('/friendvisualization', routes.postGetFriend);
// function(req, res) {
// 	var json = {"id": "alice","name": "Alice","children": [{
//         "id": "bob",
//             "name": "Bob",
//             "data": {},
//             "children": [{
//             	"id": "dylan",
//             	"name": "Dylan",
//             	"data": {},
//             	"children": []
//             }, {
//             	"id": "marley",
//             	"name": "Marley",
//             	"data": {},
//             	"children": []
//             }]
//         }, {
//             "id": "charlie",
//             "name": "Charlie",
//             "data": {},
//             "children": [{
//                 "id":"bob"
//             }]
//         }, {
//             "id": "david",
//             "name": "David",
//             "data": {},
//             "children": []
//         }, {
//             "id": "peter",
//             "name": "Peter",
//             "data": {},
//             "children": []
//         }, {
//             "id": "michael",
//             "name": "Michael",
//             "data": {},
//             "children": []
//         }, {
//             "id": "sarah",
//             "name": "Sarah",
//             "data": {},
//             "children": []
//         }],
//         "data": []
//     };
//     res.send(json);
// });

app.get('/getFriends/:user', routes.postGetFriend); //routes.sendFriends?
// function(req, res) {
//   console.log(req.params.user);
//   var newFriends = {"id": "alice","name": "Alice","children": [{
//       "id": "james",
//           "name": "James",
//           "data": {},
//           "children": [{
//               "id": "arnold",
//               "name": "Arnold",
//               "data": {},
//               "children": []
//           }, {
//               "id": "elvis",
//               "name": "Elvis",
//               "data": {},
//               "children": []
//           }]
//       }, {
//           "id": "craig",
//           "name": "Craig",
//           "data": {},
//           "children": [{
//               "id":"arnold"
//           }]
//       }, {
//           "id": "amanda",
//           "name": "Amanda",
//           "data": {},
//           "children": []
//       }, {
//           "id": "phoebe",
//           "name": "Phoebe",
//           "data": {},
//           "children": []
//       }, {
//           "id": "spock",
//           "name": "Spock",
//           "data": {},
//           "children": []
//       }, {
//           "id": "matt",
//           "name": "Matthe",
//           "data": {},
//           "children": []
//       }],
//       "data": []
//   };
//   res.send(newFriends);
//});

// ace: routes call

// socket io setup for chat function
    const io = new Server(server);

    function sendTime() {
	    io.emit('message', {message: new Date().toJSON()});
    }

    setInterval(sendTime, 10000);

    io.on('connection', function(socket) {
		
	
        socket.on('chat message', function(obj){
			console.log(obj.text);
			io.to(obj.room).emit('chat message', obj);
		});
		
		socket.on('join room', obj => {
			socket.join(obj.room);
			console.log(obj.room);
		});
		
		socket.on('leave room', obj =>{
			socket.leave(obj.room);
		});
		
    });

// server.listen(3000);

/** moves to chat page: should have a list of user's chats, and a new chat room button. REFRESH every 3 seconds */
app.get('/chat', routes.loadChatPage);
app.post('/chatlist', routes.postChatList);
/** adds new chat to list, opens up chatroom, button to add friend, text input box + button to send text */
app.get('/createroom', routes.addChat);
/** opens up chatroom chosen from list; loads and outputs list of previous messages */
app.post('/openroom', routes.openChat);
app.post('/leaveroom', routes.leaveChat);
// open CHATBOX should REFRESH every 1 second. Chatbox should leave button
/** popup list of friends user can add to chat */
app.get('/friendstoadd', routes.popupFriends);
/** in chatroom box, button that allows adding a friend */
app.get('/addfriend', routes.addFriend);
/** send msg to database, refreshes page */
app.post('/sendmessage', routes.sendMessage);

/** reload list of chats */
app.get('/reloadchats', routes.reloadChats);
/** reload chat, by which I mean res.JSON list of messages to Frontend (look at my app.js /output for HW4)*/
app.get('/reloadroom', routes.reloadRoom);

/** if request is sent by chat admin, remove user from chat */
app.get('/removeuser', routes.removeUser);
/** button to view list of particpants in chat */
app.get('/viewchatdetails', routes.viewUsers);

// end of ace

// app.get('/news', null);

//AJAX Post
app.post('/ajaxpostsignup', routes.postCreateUser);
app.post('/ajaxpostlogin', routes.postLoginUser);
app.post('/ajaxgetwall', routes.postWallRefresh);
app.post('/ajaxsearchuser', routes.postScanUsers);
app.post('/ajaxaddfriend', routes.postAddFriend);
app.post('/ajaxgetfriends', routes.postGetFriend);
app.post('/ajaxedituser', routes.postEditUser);

// news

app.get('/news', routes.calculateRank);
app.get('/newSearch', routes.searchNews);



app.get('*', (req, res) => {
  res.render('404');
})

// app.listen(PORT, () => console.log(`Example app is listening on port ${PORT}`));
server.listen(PORT, () => console.log(`Example app is listening on port ${PORT}`));


