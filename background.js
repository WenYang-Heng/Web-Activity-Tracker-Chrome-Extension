let startTime = new Date();
let timeOnSite;
let previousDomain = null;
let currentDomain = null;
let currentDate;
let idleTime = 0;
let totalIdleTime = 0;
const idleDetection = 15;

// New function to initialize the current domain when Chrome starts
function initializeCurrentDomain() {
  chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
    if (activeTab && activeTab.url && !activeTab.url.startsWith("chrome://")) {
      currentDomain = new URL(activeTab.url).hostname;
      startTime = new Date();
    }
  });
}

// Call the new function to initialize the current domain
initializeCurrentDomain();

// Rest of your original code

chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
      if (tab.url && tab.status === "complete" && !tab.url.startsWith("chrome://")) {
        let url = new URL(tab.url);
        currentDomain = url.hostname;
        timeSpent(); // Move this line out of the if condition
        if (currentDomain !== previousDomain) {
          if (timeOnSite > 0) {
            storage();
            console.log("Time spent on " + previousDomain + ": " + timeOnSite);
          }
          startTime = new Date();
        } else {
          console.log("switched to the same domain");
        }
      }
    });
  });
  
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    console.log("page refreshed");
    if(changeInfo.url && tab.url && !tab.url.startsWith('chrome://')){
        //check if the url has changed
        currentDomain = new URL(changeInfo.url).hostname;
        if(changeInfo.url && currentDomain !== previousDomain){
            timeSpent();
            if(timeOnSite > 0){
                storage();
                console.log("time spent on " + previousDomain + " :" + timeOnSite);         
                startTime = new Date();       
            }
        }else{
            console.log("page refreshed to same domain: " + currentDomain);
        }
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    // Check if there are any other tabs open in the window
    chrome.tabs.query({currentWindow: true}, function(tabs) {
        if (tabs.length === 0) {
            // previousDomain = new URL(tabs.url).hostname;
            timeSpent();
            // The closed tab was the last one in the window
            // Track the time spent on the previous domain
            console.log("time spent on " + previousDomain + " :" + timeOnSite); 
            storage();
            // Reset the previous domain to null
        } 
    });
});

function timeSpent(){
    console.log("Calculataing time, idle time is :" + totalIdleTime)
    timeOnSite = (new Date() - startTime) - totalIdleTime;
}

function storage(){
    currentDate = getDate();

    chrome.storage.local.get(null, function(result){
        let keys = Object.keys(result);

        keys.sort(function(a, b) {
            let dateA = new Date(a.split("-").reverse().join("-")).getTime();
            let dateB = new Date(b.split("-").reverse().join("-")).getTime();
            return dateA - dateB;
          });

        if(keys.length > 7){
            console.log("keys exceeded");
            let oldestKey = keys.shift();
            // chrome.storage.local.remove(oldestKey, function(){
            //     console.log(`Deleted oldest key: ${oldestKey}`);
            // });
        }

        console.log("Number of keys in storage: " + keys.length);

        // chrome.storage.local.remove(currentDate, function(){
        //     console.log("all keys cleared");
        // });
    });

    chrome.storage.local.get(currentDate, function(result){
        //initialize the object if storage is empty
        if(Object.keys(result).length === 0){
            let day = {}; //creates an empty object
            day[currentDate] = []; // assigns empty array to the object identified by the date
            chrome.storage.local.set(day, function(){
                console.log(`Created new object for ${currentDate}`);
            });
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

            chrome.storage.local.set({[currentDate]: stats}, function(){
                console.log(`Pushed data to ${currentDate}`);
                console.log(result[currentDate]);
            });       
        }

        previousDomain = currentDomain;
        totalIdleTime = 0;
    });
}

function getDate() {
    let now = new Date();
    now.setDate(now.getDate());
    let date = now.toLocaleDateString('en-GB');
    return date.split('/').join('-');
}

chrome.idle.setDetectionInterval(idleDetection);

chrome.idle.onStateChanged.addListener(function(newState){
    let idleInterval;
    if(newState === "idle"){
        console.log("now idle");
        idleTime = 0;
        idleInterval = setInterval(incrementIdleTime, 1000);
    }else{
        clearInterval(idleInterval);
        totalIdleTime = (idleTime + idleDetection) * 1000;
        console.log("now active, idle for " + totalIdleTime);  
    }
});

function incrementIdleTime(){
    idleTime++;
}

