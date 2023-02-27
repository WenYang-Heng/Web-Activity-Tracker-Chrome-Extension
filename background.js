
let domainName;
let enterTime;
let timeSpent;
let idleDetection = 15;
let idleTime = 0;
let totalIdleTime;
let idleInterval;


chrome.tabs.onCreated.addListener(function(tabs){
    getDomainName();
});

chrome.tabs.onActivated.addListener(function(activeInfo){
    chrome.tabs.get(activeInfo.tabId, function(tab){
        if(tab.url === "chrome://newtab/"){
            console.log("empty tab");
        }else{
            console.log("you are here: " + tab.url);
        }
        
    });
});

chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
    //I should track exit time here
    if (tab.active && change.url){
        console.log("changed you are here: " + change.url)
    }
});

chrome.tabs.onRemoved.addListener(function(tabid, removed){
    timeSpent = Date.now() - enterTime; //need to convert to seconds
    console.log(timeSpent);
    console.log("Idle time: " + idleTime);
});

// function getSiteName(domainName){
//     console.log("Site: " + domainName );
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


function getDomainName(){
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs){
        // domainName = tabs[0].url.split("/")[2];
        try {
            let tab = tabs[0];
            let url = new URL(tab.url)
            let domainName = url.hostname;
            console.log(domainName);
        } catch (e) {
            console.log(e);
        }
    });
}

function exitTime(){

}