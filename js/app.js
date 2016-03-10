var $ = require('jQuery');

var stepComplete = false;
var globalTimeout = undefined;
var csInterface = new CSInterface();
var learningServerURL = "http://localhost:45063";
var socket;

//Setting up the downloader to get the remote file
var fileName = "test.jpg";
var downloadLocation = "/Users/gaappr/Desktop/";
var remoteLoc = "http://gaappr.cias.rit.edu/ps_test/";
var downloader = require('downloader');
downloader.on('done', function (msg) {
    csInterface.evalScript("addNew()");
});
downloader.on('error', function (msg) {
    console.log('downloader error: ' + msg);
});

/**
* Setup the event handlers that this socket requires
**/
function setupSocket(){
    socket=io(learningServerURL);

    socket.on('beginPoll', poll);
    
    socket.on('connect', function(data){
        console.log('connect: ' + data);
    });

    socket.on('loginVerified', function(){
       downloader.download(remoteLoc + fileName, downloadLocation);
    });
}

function poll() {
    checkMode();
    if (!stepComplete) {
        globalTimeout = setTimeout(poll, 2000);
    }
}


//Checks to see if the document mode has been changed
function checkMode() {
    csInterface.evalScript("getDocMode()",
        function (res) {
            if (res == "DocumentMode.CMYK") {
                socket.emit("modeChanged", {
                    "mode": res
                });
                stepComplete = true;
                if (globalTimeout) {
                    clearTimeout(globalTimeout);
                    globalTimeout = undefined;
                }
            }
        });
}

$(document).ready(function(){
    setupSocket();

    $("#btn").on('click', function(event){
        event.preventDefault();
        socket.emit('loginAttempt', {
            username:$("#username").val()
        });
    });
});