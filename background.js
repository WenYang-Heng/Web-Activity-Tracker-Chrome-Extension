
let currentSiteName;
let enterTime;
let timeSpent;
let idleDetection = 15;
let idleTime = 0;
let totalIdleTime;
let idleInterval;


chrome.tabs.onCreated.addListener(function(){
    enterTime = Date.now();
    // chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(){
    //     getSiteName(tabs[0].url.split("/")[2]);
    // });

});

chrome.tabs.onRemoved.addListener(function(tabid, removed){
    timeSpent = Date.now() - enterTime; //need to convert to seconds
    console.log(timeSpent);
    console.log("Idle time: " + idleTime);
});

// function getSiteName(currentSiteName){
//     console.log("Site: " + currentSiteName );
// }

chrome.idle.setDetectionInterval(idleDetection);

// chrome.idle.queryState(idleDetection, function(state){
//     if(state === "idle"){
//         console.log("now idle");
//     }
//     else{
//         console.log("now active");
//     }
// });

chrome.idle.onStateChanged.addListener(function(newState){

    if(newState === "idle"){

        console.log("now idle");
        idleTime = 0;
        idleInterval = setInterval(incrementIdleTime, 1000);

    }else{

        clearInterval(idleInterval);
        totalIdleTime = idleTime + idleDetection;
        console.log("now active, idle for " + totalIdleTime);
        
    }

});

function incrementIdleTime(){
    idleTime++;
}