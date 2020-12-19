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

var myTable = $('#myTable').DataTable();

// = $(document).ready( function () {
//     $('#myTable').DataTable();
// } );

var createGameBtn = document.getElementById('createGameBtn');
var newRoundBtn = document.getElementById('newRoundBtn');
var firstToBuzzInElement = document.getElementById('firstToBuzzInElement');
var groupName = document.getElementById("groupName");
var buzzedInPlayerData = [];

// TODO - figure out how to keep persistent connection
var database = firebase.database();

function createGame() {
    if (groupName.value.trim().length > 0) {

        newRound();

        // Set up listener for buzzed in players
        var groupDbRef = database.ref('groups/' + groupName.value.trim()).child('buzzedInPlayers');
        groupDbRef.on('child_added', function (data) {
            if (data.val()) {
                var username = data.val().username;
                var timestamp = data.val().timestamp;
                console.log("Someone buzzed in: " + username + ' ' + timestamp)
                firstToBuzzInElement.innerHTML += username + '<br>';

                buzzedInPlayerData.push({ "Username": username, "Timestamp": timestamp })

                buzzedInPlayerData.sort((a, b) => (a.Timestamp > b.Timestamp) ? 1 : -1)
                database.ref('groups/' + groupName.value.trim()).child('firstToBuzzIn').set(buzzedInPlayerData[0].Username);
                firstToBuzzInElement.innerText = "First to Buzz In: " + buzzedInPlayerData[0].Username;

                console.log({ "data": buzzedInPlayerData })
                myTable.row.add([username, convertToLocalTime(timestamp)]).draw();
            }
            console.log(buzzedInPlayerData);
        })
    } else {
        firstToBuzzInElement.innerText = "Please fill out group field.";
    }
}

/**
 * Function called on buzz in button click
 */
function newRound() {

    console.log("New Round!");

    if (groupName.value.trim().length > 0) {
        // Clear Buzzed In Player List
        database.ref('groups/' + groupName.value.trim()).child('buzzedInPlayers').set("");

        // Clear first to buzz in
        database.ref('groups/' + groupName.value.trim()).child('firstToBuzzIn').set("");

        // Set enable buzzing to true
        database.ref('groups/' + groupName.value.trim()).child('enableBuzzing').set(true);

        // Update UI
        createGameBtn.style.display = "none";
        newRoundBtn.style.visibility = "visible";
        firstToBuzzInElement.innerHTML = "";
        buzzedInPlayerData = [];
        myTable.clear().draw();
    } else {
        firstToBuzzInElement.innerHTML = "Group field is empty."
    }

}

function convertToLocalTime(unix_timestamp) {
    var date = new Date(unix_timestamp);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();

    var milliseconds = date.getMilliseconds();

    // Will display time in 10:30:23 format
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2) + ":" + milliseconds;

    console.log(formattedTime);

    return formattedTime;
}

