var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var users = {};
var sockets = {};
var alreadyConnectedUserList = [];
app.listen(8081);

function handler(req, res) {
    fs.readFile(__dirname + '/index.html', function(err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }
        res.writeHead(200);
        res.end(data);
    });
};
io.on('connection', function(socket) {
    // Register your client with the server, providing your username
    socket.on('init', function(username) {
        if (alreadyConnectedUserList.length) {
            socket.emit('connectedUsersList', alreadyConnectedUserList);
        }
        alreadyConnectedUserList.push(username)
        users[username] = socket.id; // Store a reference to your socket ID
        sockets[socket.id] = {
            username: username,
            socket: socket
        }; // Store a reference to your socket
        //we will send current user that who all are already connected in chat
        //send to all users that a new user is connected
        for (currentSocket in sockets) {
            if (currentSocket == socket.id) return false;
            sockets[currentSocket].socket.emit('userJoined', {
                username: username
            });
        };
        //send all users list to newly connected user
    });
    socket.on('notification', function(obj) {
        console.log(obj);
        if (!users[obj.to]) {
            console.log("user " + obj.to + " dosent exist");
            return false;
        }
        // Lookup the socket of the user you want to private message, and send them your message
        try {
            sockets[users[obj.to]].socket.emit('notification', {
                message: obj.message,
                from: sockets[socket.id].username
            });
        } catch (e) {
            console.error("Error when sending data: " + e);
        }
    });
    socket.on('disconnect', function() {
        var disconnectedUsername = null;
        for (currentSocket in sockets) {
            if (currentSocket == socket.id) {
                disconnectedUsername = sockets[currentSocket].username;
                delete users[sockets[currentSocket].username];
                alreadyConnectedUserList.splice(alreadyConnectedUserList.indexOf(sockets[currentSocket].username), 1);
                delete sockets[currentSocket];
            }
        }
        if (disconnectedUsername) {
            for (currentSocket in sockets) {
                sockets[currentSocket].socket.emit('userDisconnected', {
                    username: disconnectedUsername
                });
            }
        }
    });
});