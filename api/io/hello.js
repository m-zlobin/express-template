module.exports = function(io, socket) {
    
    socket.on("hello", function (name, callback) {

        /* Very short doc

        http://stackoverflow.com/a/10099325/2550004

        // sending to sender-client only
        socket.emit('message', "this is a test");

        // sending to all clients, include sender
        io.emit('message', "this is a test");

        // sending to all clients except sender
        socket.broadcast.emit('message', "this is a test");

        // sending to all clients in 'game' room(channel) except sender
        socket.broadcast.to('game').emit('message', 'nice game');

        // sending to all clients in 'game' room(channel), include sender
        io.in('game').emit('message', 'cool game');

        // sending to sender client, only if they are in 'game' room(channel)
        socket.to('game').emit('message', 'enjoy the game');

        // sending to all clients in namespace 'myNamespace', include sender
        io.of('myNamespace').emit('message', 'gg');

        // sending to individual socketid
        socket.broadcast.to(socketid).emit('message', 'for your eyes only');    
        */

        callback(null, `Hello ${name}!`);

        // send to all clients except sender
        socket.broadcast.emit("hello", `Hello from ${name}!`);
    });
};


