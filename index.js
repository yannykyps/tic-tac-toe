const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.Server(app).listen(3000);
const io = socketIo(server);

let players = {};
let playerWaiting;


app.use(express.static(__dirname + "/client/"));


app.get("/", (req, res) => {
    const stream = fs.createReadStream(__dirname + "/client/index.html");
    stream.pipe(res);
});

io.on("connection", (socket) => {
    let id = socket.id;
    console.log("New user connected. ID: ", id);
    //clients[socket.id] = socket;
    //console.log(clients);
    
    socket.on("disconnect", () => {
        console.log("User disconnected. ID: ", id);
        //delete socket.id;
        //delete clients[socket.id];
        socket.broadcast.emit("User disconnected", id);

    });

    join(socket);
    //console.log(players);

    if (hasOpponent(socket)) { // If the current player has an opponent the game can begin
        socket.emit("start.game", { // Send the start game event to the player
            symbol: players[socket.id].symbol
        });

        hasOpponent(socket).emit("start.game", { // Send the start game event to the opponent
            symbol: players[hasOpponent(socket).id].symbol 
        });
    }

    socket.on("make.move", (data) => {
        socket.emit("move.made", data);
        hasOpponent(socket).emit("move.made", data);
          
    });

    socket.on("new.game", () => {
        socket.emit("new.game");
        hasOpponent(socket).emit("new.game");
        socket.emit("start.game", { // Send the start game event to the player
            symbol: players[socket.id].symbol
        });
        hasOpponent(socket).emit("start.game", { // Send the start game event to the opponent
            symbol: players[hasOpponent(socket).id].symbol 
        });
    });
   
    // Event to inform player that the opponent left
    socket.on("disconnect", () => {
        if (hasOpponent(socket)) {
        hasOpponent(socket).emit("opponent.left");
        }
    });

});

function join(socket) {
    players[socket.id] = {
        player: "Player 1",
        opponent: playerWaiting,
        symbol: "X",
        socket: socket
    };

    if (playerWaiting) {
        players[socket.id].player = "Player 2";
        players[socket.id].symbol = "O";
        players[playerWaiting].opponent = socket.id;
        playerWaiting = null;
    } else {
        playerWaiting = socket.id;
        }
}

function hasOpponent(socket) {
    if (!players[socket.id].opponent) {
            return;
    }
    return players[players[socket.id].opponent].socket;
}