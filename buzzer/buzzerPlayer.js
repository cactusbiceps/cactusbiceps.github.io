var buzzInButton = document.getElementById('buzzInBtn');
var joinGameButton = document.getElementById('connectBtn');
var firstToBuzzInElement = document.getElementById('firstToBuzzInElement');
var connectionStatusElement = document.getElementById('connectionStatus');
var messageFromHostElement = document.getElementById('messageFromHost');
var inputName = document.getElementById("inputName");
var groupName = document.getElementById("groupName");
var buzzInAudio = new Audio('buzzer.wav');

let gameId, teamName;
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
    MESSAGE_FROM_HOST: 'MESSAGE_FROM_HOST',
    GAME_OVER: 'GAME_OVER'
};

function connectToGame() {
    if (groupName.value.trim().length > 0 && groupName.value.trim().length > 0 ) {
        gameId = groupName.value.trim();
        teamName = inputName.value.trim();
        webSocket = new WebSocket('wss://buzzer.cactusbiceps.com:4568');

        webSocket.onmessage = (event) => {
            console.log(event.data)
            try {
                if(event.data.includes('Joined game')) {
                    joinGameButton.disabled = true;
                    buzzInButton.disabled = false;
                    gameSetupAfterJoining();
                } else if(event.data.includes('Game lobby does not exist')) {
                    firstToBuzzInElement.innerText = event.data;
                } else if(event.data.includes('reset')) {
                    buzzInButton.disabled = false;
                    buzzInButton.style.visibility = "visible";
                    firstToBuzzInElement.innerText = 'Buzzer ready!';
                } else if(event.data.includes('lock')) {
                    buzzInButton.disabled = true;
                    firstToBuzzInElement.innerText = 'Buzzer locked.';
                } else if(event.data.includes('game over')) {
                    buzzInButton.disabled = true;
                    joinGameButton.disabled = false;
                    firstToBuzzInElement.innerText = 'Game over';
                    resetPage();
                } else if(event.data.includes('Host disconnected')) {
                    buzzInButton.disabled = true;
                    joinGameButton.disabled = false;
                    firstToBuzzInElement.innerText = 'Game over. Host disconnected.';
                    resetPage();
                } else {
                    var messageObj = JSON.parse(event.data);
                    if(messageObj.type == messageTypes.FIRST_TO_BUZZ) {
                        if (teamName.trim().toLowerCase() == messageObj.value.trim().toLowerCase()) {
                            buzzInAudio.play();
                            firstToBuzzInElement.innerText = "You were the first to buzz in!";
                            confetti.start(4000);
                        } else {
                            firstToBuzzInElement.innerText = messageObj.value + " was the first to buzz in!";
                        }
                    } else if(messageObj.type == messageTypes.MESSAGE_FROM_HOST) {
                        messageFromHostElement.innerText = messageObj.value;
                    }
                }     
            } catch(e) {
              console.log(e.message);
            }
        };
        webSocket.addEventListener("open", () => {
            console.log("We are connected");
            connectionStatusElement.innerText = 'Server connected';
            gameInitialization();
        });
        webSocket.addEventListener("close", () => {
            connectionStatusElement.innerText = 'Server Disconnected';
        });
    } else {
        firstToBuzzInElement.innerText = "Please fill out group and name fields.";
    }
}

function resetPage() {
    joinGameButton.style.display = "block";
    joinGameButton.style.visibility = "visible";

    buzzInButton.style.visibility = "hidden";
    inputName.disabled = false;
    groupName.disabled = false;
}

function gameInitialization() {
    message.type = messageTypes.PLAYER_JOIN;
    message.value = {
        teamName: teamName,
        gameID: gameId
    };

    webSocket.send(JSON.stringify(message));
}

function gameSetupAfterJoining() {
    joinGameButton.style.display = "none";
    joinGameButton.style.visibility = "hidden";
    inputName.disabled = true;
    groupName.disabled = true;

    buzzInButton.style.visibility = "visible";
    firstToBuzzInElement.innerText = "Waiting for buzzer...";
    confetti.stop();
}

function buzzIn() {
    message.type = messageTypes.BUZZ_IN;
    message.value = {
        teamName: teamName,
        gameID: gameId
    };
    webSocket.send(JSON.stringify(message));

    buzzInButton.style.visibility = "hidden";
}
