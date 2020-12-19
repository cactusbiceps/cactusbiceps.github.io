// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBTetO83HKAe13ftYP3HFzpXAoCe4RUywE",
    authDomain: "buzzed-f271d.firebaseapp.com",
    databaseURL: "https://buzzed-f271d.firebaseio.com",
    projectId: "buzzed-f271d",
    storageBucket: "buzzed-f271d.appspot.com",
    messagingSenderId: "276651341737",
    appId: "1:276651341737:web:09426e201e7e4e66f736b8",
    measurementId: "G-WBNRBSSHSM"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var createGameBtn = document.getElementById('buzzInBtn');
var newRoundBtn = document.getElementById('connectBtn');
var firstToBuzzInElement = document.getElementById('firstToBuzzInElement');
var inputName = document.getElementById("inputName");
var groupName = document.getElementById("groupName");
var buzzInAudio = new Audio('buzzer.wav');

// TODO - figure out how to keep persistent connection
var database = firebase.database();

function connectToGame() {
    if (groupName.value.trim().length > 0) {
        newRoundBtn.style.display = "none";

        // Set up listener for enableBuzzing database child
        var enableBuzzingRef = database.ref('groups/' + groupName.value.trim() + '/enableBuzzing');
        enableBuzzingRef.on('value', function (snapshot) {
            console.log("Enable buzzer value: " + snapshot.val());
            if (snapshot.val()) {
                createGameBtn.style.visibility = "visible";
            } else {
                createGameBtn.style.visibility = "hidden";
            }
        })

        // Set up listener for firstToBuzzIn database child
        var firstToBuzzInRef = database.ref('groups/' + groupName.value.trim() + '/firstToBuzzIn');
        firstToBuzzInRef.on('value', function (snapshot) {
            try{
                console.log("First to Buzz In: " + snapshot.val());
                if (snapshot.val().length == 0) {
                    createGameBtn.style.visibility = "visible";
                    firstToBuzzInElement.innerText = "Waiting for buzzer...";
                    confetti.stop();
                } else {
                    if (inputName.value.trim().toLowerCase() == snapshot.val().trim().toLowerCase()) {
                        firstToBuzzInElement.innerText = "You were the first to buzz in!";
                        confetti.start(4000);
                    } else {
                        firstToBuzzInElement.innerText = snapshot.val() + " was the first to buzz in!";
                    }

                }
            } catch(e){
                console.log(e);
                firstToBuzzInElement.innerText = "This group has not been created yet by the game manager.";
            }
            
        })
    } else {
        firstToBuzzInElement.innerText = "Please fill out group field.";
    }
}

/**
 * Function called on buzz in button click
 */
function buzzIn() {

    if (inputName.value.trim().length > 0) {
        database.ref('groups/' + groupName.value.trim() + '/buzzedInPlayers').push().set({
            "username": inputName.value.trim(),
            "timestamp": firebase.database.ServerValue.TIMESTAMP
        })

        buzzInAudio.play();
        createGameBtn.style.visibility = "hidden";
        firstToBuzzInElement.innerText = "Waiting on results from manager...";
    } else {
        firstToBuzzInElement.innerText = "Name field is empty."
    }

}

