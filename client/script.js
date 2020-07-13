const socket = io();

let symbol;
let myTurn = true;

function boardState() {
    let obj = {};

$(".board button").each(function() {
    obj[$(this).attr("id")] = $(this).text() || "";
    
});
    return obj;
}

function winner() {
    let state = boardState();
    let matches = ["XXX", "OOO"];
    let winState = "No Win"
    let win = [
        state.a1 + state.b1 + state.c1, //row win
        state.a2 + state.b2 + state.c2, //row win
        state.a3 + state.b3 + state.c3, //row win
        state.a1 + state.a2 + state.a3, //column win
        state.b1 + state.b2 + state.b3, //column win
        state.c1 + state.c2 + state.c3, //column win
        state.a1 + state.b2 + state.c3, //diagonal win
        state.a3 + state.b2 + state.c1 //diagonal win
    ]
    
    for (var i = 0; i < win.length; i++) {
        
        if (win[i] === matches[0] || win[i] === matches[1]) {
            return winState = "Win";
        } else if (win.every(n => n.length === 3)) {
            return winState = "Draw";
        }           
    }

    return winState;
}

function draw() {
    $("#message").text("Draw");
    $(".board button").attr("disabled", true);
    $(".reset button").attr("style", "visibility: visible");
}

function whosTurn() {
    if (!myTurn) {
        $("#message").text("Your opponent's turn");
        $(".board button").attr("disabled", true);
    } else {
        $("#message").text("Your turn.");
        $(".board button").attr("disabled", false);
    }
}

function makeMove() {
    if ($(this).text().length) {
        return; // If cell is already checked
    }
    socket.emit("make.move", {
        symbol: symbol,
        position: $(this).attr("id")
    });
}

function resetBoard() {
    $(".board button").text("");
    $(".reset button").attr("style", "visibility: hidden");
}

$(function() {
    $(".board button").attr("disabled", true);
    $(".board button").on("click", makeMove);
    $(".reset button").attr("style", "visibility: hidden");
    $(".reset button").on("click", function() {
        socket.emit("new.game", "");
    });
});

socket.on("start.game", (data) => {
    symbol = data.symbol;
    myTurn = symbol === "X";
    whosTurn();
});

socket.on("opponent.left", () => {
    $("#message").text("Your opponent has left");
    $(".board button").attr("disabled", true);
});

socket.on("move.made", (data) => {
    $("#" + data.position).text(data.symbol);

    myTurn = data.symbol !== symbol;

    if (winner() === "No Win") {
        whosTurn();
    } else if (winner() === "Draw") {
        draw();
    } else {
        if (myTurn) {
            $("#message").text("You lose");
        } else {
            $("#message").text("You win");
        }
    
        $(".board button").attr("disabled", true);
        $(".reset button").attr("style", "visibility: visible");
    }

})

socket.on("reset", () => {
    resetBoard();
});