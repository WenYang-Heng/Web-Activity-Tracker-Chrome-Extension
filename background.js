// let domainName;
// let previousDomainName;
// let enterTime;
// let timeSpent;
// let idleDetection = 15;
// let idleTime = 0;
// let totalIdleTime;
// let idleInterval;

let startTime;
let timeOnSite;
let previousDomain = null;
let currentDomain = null;
let currentDate;

// chrome.tabs.onActivated.addListener(function(activeInfo){
//     console.log("on activated event fires");
//     chrome.tabs.get(activeInfo.tabId, function(tab){
//         if(tab.url && tab.status === 'complete' && !tab.url.startsWith('chrome://')){
//             let url = new URL(tab.url);
//             currentDomain = url.hostname;
//             if(currentDomain !== previousDomain){
//                 timeSpent();
//                 storage();
//                 console.log("Time spent on " + previousDomain + ": " + timeOnSite);
//             }else{
//                 console.log("switched to the same domain");
//             }
//             startTime = new Date();
//         }
//     });
// });

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if(changeInfo.url && tab.url && !tab.url.startsWith('chrome://')){
        //check if the url has changed
        currentDomain = new URL(changeInfo.url).hostname;
        if(changeInfo.url && currentDomain !== previousDomain){
            timeSpent();
            storage();
            console.log("time spent on " + previousDomain + " :" + timeOnSite);
        }else{
            console.log("page refreshed to same domain: " + currentDomain);
        }
        startTime = new Date();
    }
});

function timeSpent(){
    timeOnSite = new Date() - startTime;
}

function storage(){
    currentDate = getDate();
    chrome.storage.local.get(currentDate, function(result){
        //initialize the object if storage is empty
        if(Object.keys(result).length === 0){
            let day = {}; //creates an empty object
            day[currentDate] = []; // assigns empty array to the object identified by the date
            chrome.storage.local.set(day, function(){
                console.log(`Created new object for ${currentDate}`);
            });
        }else{
            console.log(`${currentDate} object exists`);
        }

        if(previousDomain !== null){
            let record = {
                domain: previousDomain,
                totalTime: timeOnSite
            }

            //check if domain exists in the object
            let check = false;
            let stats = result[currentDate]; //retrieve values of key from result object and assign it to stats
            //check if result has an object
            if(stats){
                    for(let i = 0; i < stats.length; i++){
                        if(stats[i].domain === previousDomain){
                            console.log(previousDomain + " exist, increment total time");
                            stats[i].totalTime += timeOnSite;
                            check = true;
                            break;
                        }
                    }                    
            }else{
                console.log(`${currentDate} object does not exist`);
            }
            
            if(!check){
                if(Array.isArray(stats)){
                stats.push(record);
                } else {
                stats = [record];
                }
            }

            // use Promise to ensure that storage function completes execution before updating previous domain
            chrome.storage.local.set({[currentDate]: stats}, function(){
                console.log(`Pushed data to ${currentDate}`);
                console.log(result[currentDate]);
                console.log(result);
            });

            chrome.storage.local.clear(function(){
                console.log('storage cleared');
            });            
        }

        previousDomain = currentDomain;
        console.log("previous domain changed");
        console.log("storage function finished.");
    });
}

function getDate() {
    let now = new Date();
    now.setDate(now.getDate());
    let date = now.toLocaleDateString('en-GB');
    return date.split('/').join('-');
  }

// chrome.tabs.onRemoved.addListener(function(tabid, removed){
//     timeOnSite();
// });

// // function getSiteName(domainName){
// //     console.log("Site: " + domainName );
// // }

// chrome.idle.setDetectionInterval(idleDetection);

// // chrome.idle.queryState(idleDetection, function(state){
// //     if(state === "idle"){
// //         console.log("now idle");
// //     }
// //     else{
// //         console.log("now active");
// //     }
// // });

// chrome.idle.onStateChanged.addListener(function(newState){
//     if(newState === "idle"){
//         console.log("now idle");
//         idleTime = 0;
//         idleInterval = setInterval(incrementIdleTime, 1000);
//     }else{
//         clearInterval(idleInterval);
//         totalIdleTime = idleTime + idleDetection;
//         console.log("now active, idle for " + totalIdleTime);  
//     }
// });

// function incrementIdleTime(){
//     idleTime++;
// }

