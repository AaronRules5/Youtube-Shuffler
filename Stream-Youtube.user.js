// ==UserScript==
// @name         Stream Youtube
// @namespace    https://github.com/AaronRules5/Youtube-Shuffler/
// @version      1.0
// @description  Better youtube shuffler
// @author       AaronRules5
// @match        *://*.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    window.setTimeout(hidePLInitial,1000);
    window.setInterval(hideTags,1000);
    window.setInterval(ytShuffle,250);
    document.addEventListener("keydown",togglePlaylist);
})();

var visTypes = ["none","initial"];
var shuffleMode = 0;
var currentVideo = 0;

function playlistActive(){
    var ytPL = document.getElementById("playlist");
        var plContainer = ytPL.children[0].children[1];

        if (plContainer.childElementCount == 0){
            return false;
        }
    return true;
}

function shuffleActive(){
    if (!playlistActive()){
       return false;
    }
    var ytPL = document.getElementById("playlist");
    try{
        var PLButton = ytPL.children[0].children[0].children[0].children[1].children[0].children[0].children[0].children[0].children[1].children[0].children[0].children[0];
        var buttonPressed = PLButton.ariaPressed;
    }
    catch(e){
        console.log("Playlist button not found!!!");
        buttonPressed = "no";
    }

    return (buttonPressed == "true" ? true : false);

}

function isPrivateVideo(videoNum){
    var ytPL = document.getElementById("playlist");
    var plContainer = ytPL.children[0].children[1];
    return plContainer.children[videoNum].children[0].children[0].children[1].children[0].children[0].children[0].children[0].src == "https://s.ytimg.com/yts/img/meh_mini-vfl0Ugnu3.png";
}

function getVideoTitle(){
return document.title.substr(0,document.title.length - 10);
}

function superLog(detailedMessage, friendlyMessage){
    var infoContents = document.getElementById("info-contents");
    try{
    var videoTitle = infoContents.children[0].children[0].children[3];
    }
    catch (e){
        console.log("ERROR! COULD NOT SUPER LOG! POSSIBLY ON PRIVATE VIDEO!");
        return false;
    }
    if (!friendlyMessage) friendlyMessage = "GENERAL ERROR! TELL FIDDLERON!";
    videoTitle.innerText = friendlyMessage + " - " + getVideoTitle();
    console.log(detailedMessage);
    return true;
}

function clearSuperLog(){
    var infoContents = document.getElementById("info-contents");
    var videoTitle = infoContents.children[0].children[0].children[3];
    videoTitle.innerText = getVideoTitle();
}

function findVideo(){
    shuffleMode = 1; //Prevent refire.
    var videoPlayer = document.getElementById("movie_player");

    if (videoPlayer){
    videoPlayer.pauseVideo(); //STOP PLAYING
    }
    else{
    console.log("No videoplayer found?????????? returning false!");
        return false;
    }

    console.log("Finding a video...");

    var ytPL = document.getElementById("playlist");
    var plContainer = ytPL.children[0].children[1];


        console.log("Video is less than 3 seconds from completing! shuffleMode is SET and I'm pseudorandomly finding a new video...");

        var shuffleResult = Math.floor(Math.random() * plContainer.childElementCount);

        var limitTries = 0;
        while(true){
            if (isPrivateVideo(shuffleResult)){
                if (limitTries > 100){
                    console.log("ERROR: More than 100 privated/deleted videos! Returning without fixing shuffleResult to prevent hang and superLog.");
                    return false;
                }
                console.log("Warning: Nearly clicked on a private/deleted video! Trying next video...");
                limitTries++;
                shuffleResult = (shuffleResult + 1) % plContainer.childElementCount;
                continue;
            }
            break;
        }
        console.log("Suitable video candidate found. Clicking...");
        plContainer.children[shuffleResult].children[0].click();
        return true;
}

function ytShuffle(){

    if (currentVideo != window.location.href){
        currentVideo = window.location.href;
        shuffleMode = 0;
        console.log("Log: shuffleMode reset and currentVideo set to href!");
    }

    if (shuffleMode){
        superLog("ERROR: Shuffle function tried to refire but shuffleMode is set! If this message keeps refiring, press R.","SHUFFLE MAY BE STUCK!");
        return false;
    }

    var videoPlayer = document.getElementById("movie_player");
    var ytPL = document.getElementById("playlist");
    var plContainer = ytPL.children[0].children[1];

    if (!videoPlayer){
        superLog("ERROR: Playlist not found!");
        return false;
    }

    if (!playlistActive()){
        superLog("ERROR: Playlist not found!","This video is not in a playlist!");
        return false;
    }

    if (!shuffleActive()){
        superLog("Warning: Shuffle is not active! This may have been on purpose, but in case it wasn't be sure to activate it to enable shuffling.","Shuffle not active.");
        return false;
    }

    clearSuperLog();

    if ((videoPlayer.getCurrentTime() > (videoPlayer.getDuration() - 1)) && shuffleMode == 0){
    findVideo();
    }
}

function hidePLInitial(){
    var ytPL = document.getElementById("playlist");
    var liveChat = document.getElementsByTagName("ytd-live-chat-frame")[0];
    visElement(ytPL,0);
    visElement(liveChat,0);
}

function hideTags(){
    var hashTags = document.getElementsByClassName("super-title style-scope ytd-video-primary-info-renderer")[0];
    visElement(hashTags,0);
}

function visElement(element,vis){
    if(element){
        element.style.display = visTypes[vis];
        return true;
    }
    return false;
}

function togglePlaylist(e){
    if (e.key == "p" && shuffleMode == 0){
        console.log("P was pressed and shuffleMode is 0! Finding a new video...");
        findVideo();
    }
    if (e.key == "b"){
        var ytPL = document.getElementById("playlist");
    if (ytPL){
        var currentVis = visTypes.indexOf(ytPL.style.display);
        if (currentVis == -1) currentVis = 1;
        visElement(ytPL,1-currentVis);
    }
        else{
        console.log("could not toggle playlist. there is none.")
        }
    }
    if (e.key == "r"){
    shuffleMode = 0;
    }
}