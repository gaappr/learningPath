var stepComplete = false;
var globalTimeout = undefined;
var csInterface = new CSInterface();
var socket = io('http://localhost:45063');

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

socket.on('connect', function (data) {
    console.log("connected!")
});

socket.on('beginPoll', poll);

function poll() {
    checkMode();
    if (!stepComplete) {
        globalTimeout = setTimeout(poll, 2000);
    }
}

function init() {
    var button = document.getElementById("btn");
    btn.onclick = function () {
        socket.emit('clicked', {
            my: 'data'
        });
        downloader.download(remoteLoc + fileName, downloadLocation);
    };
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