var createGameBtn = document.getElementById('createGameBtn');
const firstToBuzzInElement = document.getElementById('firstToBuzzInElement');
const groupName = document.getElementById("groupName");
const lockBuzzerButton = document.getElementById('lockBuzzerButton');
const resetBuzzerButton = document.getElementById('resetBuzzerButton');
const endGameButton = document.getElementById('endGameButton');
const playerList = document.getElementById('playerList');
var myTable = $('#myTable').DataTable();
var buzzedInPlayerData = [];

let gameId = null;
let message = {type: null, value: null};
let webSocket;

const messageTypes = {
    // Incoming Messages
    NEW_GAME: 'NEW_GAME',
    PLAYER_JOIN: 'PLAYER_JOIN',
    END_GAME: 'END_GAME',
    BUZZER_LOCK: 'BUZZER_LOCK',
    BUZZER_RESET: 'BUZZER_RESET',

    // Outgoing Messages
    FIRST_TO_BUZZ: 'FIRST_TO_BUZZ',
    BUZZ_IN: 'BUZZ_IN',
    TEAM_JOINED: 'TEAM_JOINED',
    TEAM_LEFT: 'TEAM_LEFT',
    BUZZER_LOCKED: 'BUZZER_LOCKED',
    GAME_OVER: 'GAME_OVER'
};

createGameBtn.addEventListener('click', () => {
    if (groupName.value.trim().length > 0) {

        gameId = groupName.value.trim();
        webSocket = new WebSocket('wss://buzzer.cactusbiceps.com:4568');
        // webSocket = new WebSocket('wss://localhost:4568');

        webSocket.onmessage = (event) => {
            console.log(event.data)
            // document.getElementById('messages').innerHTML += 
            //   'Message from server: ' + event.data + "<br>";
            try {
              var messageObj = JSON.parse(event.data);
              if(messageObj.type == messageTypes.BUZZ_IN) {
                myTable.row.add([messageObj.value.team, messageObj.value.time]).draw();
              } else if(messageObj.type == messageTypes.TEAM_JOINED) {
                playerList.innerHTML = '';
                for (const team of messageObj.value.teams) {
                    const teamListItem = document.createElement('li');
                    teamListItem.textContent = team;
                    playerList.appendChild(teamListItem);
                }
              }
            } catch(e) {
              console.log(e.message);
            }
        };
        webSocket.addEventListener("open", () => {
            console.log("We are connected");
            gameInitialization();
        });
        webSocket.addEventListener("close", () => {
            firstToBuzzInElement.innerText = 'Server Disconnected'
        });

    } else {
        firstToBuzzInElement.innerText = "Please fill out group field.";
    }
});

function gameInitialization() {
    message.type = messageTypes.NEW_GAME;
    message.value = {
        gameID: gameId
    }

    webSocket.send(JSON.stringify(message));

    createGameBtn.style.display = "none";
    lockBuzzerButton.style.visibility = "visible";
    resetBuzzerButton.style.visibility = "visible";
    endGameButton.style.visibility = "visible";
    createGameBtn.disabled = true;
    endGameButton.disabled = false;
    groupName.disabled = true;
    firstToBuzzInElement.innerHTML = "";
    buzzedInPlayerData = [];
    myTable.clear().draw();
    playerList.innerHTML = '';
}

lockBuzzerButton.addEventListener('click', () => {
    message.type = messageTypes.BUZZER_LOCK;
    message.value = {
      gameID: gameId
    } 

    webSocket.send(JSON.stringify(message));
});

resetBuzzerButton.addEventListener('click', () => {
    message.type = messageTypes.BUZZER_RESET;
    message.value = {
      gameID: gameId
    } 

    myTable.clear().draw();
    firstToBuzzInElement.innerHTML = "";
    webSocket.send(JSON.stringify(message));
});

endGameButton.addEventListener('click', () => {
    message.type = messageTypes.END_GAME;
    message.value = {
      gameID: gameId
    } 
    webSocket.send(JSON.stringify(message));
    // startGameButton.disabled = false;
    createGameBtn.style.display = "inline";
    createGameBtn.disabled = false;
    // newRoundBtn.style.display = "none";
    endGameButton.disabled = true;
    groupName.disabled = false;
});
