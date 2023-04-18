let startTime = new Date();
let timeOnSite;
let previousDomain = null;
let currentDomain = null;
let currentDate;
let idleTime = 0;
let totalIdleTime = 0;
const idleDetection = 15;
const extensionInternal = "chrome://extensions";
const newTab = "newtab";
let currentActiveTabId = null;

// New function to initialize the current domain when Chrome starts
function initializeCurrentDomain() {
  chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
    if (activeTab && activeTab.url && !activeTab.url.startsWith(extensionInternal)) {
        currentDomain = new URL(activeTab.url).hostname;
        if(currentDomain === newTab){
            previousDomain = currentDomain;
            console.log("current: " + currentDomain);
            console.log("previous: " + previousDomain);
        }
        else{
            startTime = new Date();     
        }
    }
  });
}

// Call the new function to initialize the current domain
initializeCurrentDomain();

chrome.tabs.onCreated.addListener(function (tab) {
    if(tab.url.startsWith("chrome://newtab") && previousDomain === newtab){
        console.log("opened an empty tab");
        currentDomain = newTab;
        previousDomain = currentDomain;
    }
    else if (previousDomain !== null && previousDomain !== newTab) {
      timeSpent();
      if (timeOnSite > 0) {
        storage(previousDomain, timeOnSite);
        console.log("New tab created. Time spent on " + previousDomain + ": " + timeOnSite);
        previousDomain = currentDomain;
      }
    }
    else{
        console.log("opened another empty tab");
    }
});

chrome.tabs.onActivated.addListener(function (activeInfo){
    currentActiveTabId = activeInfo.tabId;
    chrome.tabs.get(activeInfo.tabId, function (tab){
        if (tab.url && tab.status === "complete" && !tab.url.startsWith(extensionInternal)){
            currentDomain = new URL(tab.url).hostname;
            //if switch to an empty tab and previous tab is not null
            if(currentDomain === newTab && previousDomain !== newTab){
                timeSpent();
                storage(previousDomain, timeOnSite);
                startTime = new Date();
                previousDomain = currentDomain;
            }
            else if(previousDomain === newTab && currentDomain !== newTab){
                console.log("switched from empty tab to " + currentDomain + ". Start tracking now");
                previousDomain = currentDomain;
                startTime = new Date();
            }
            else if(currentDomain !== previousDomain){
                timeSpent();
                storage(previousDomain, timeOnSite);
                startTime = new Date();
                previousDomain = currentDomain;
            }
            else{
                previousDomain = currentDomain;
                console.log("switch to same domain");
            }
        }
    });
});
  
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if(changeInfo.status === 'complete'){
        if(tab.url && !tab.url.startsWith(extensionInternal)){
            console.log("page has refreshed.");
            currentDomain = new URL(tab.url).hostname;
            if(currentDomain === newTab){
                previousDomain = currentDomain;
            }
            else if(previousDomain === newTab && currentDomain !== newTab){
                startTime = new Date();
                console.log("refreshed from " + previousDomain + " to " + currentDomain + ". Start tracking now");
                previousDomain = currentDomain;
            }
            else if(previousDomain !== newTab && currentDomain !== newTab){
                if(previousDomain !== currentDomain){
                    timeSpent();
                    storage(previousDomain, timeOnSite);
                    startTime = new Date();
                    previousDomain = currentDomain;
                }
            }
        }
    }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    if(removeInfo.isWindowClosing){
        if (removeInfo.isWindowClosing) {
            if (tabId === currentActiveTabId) {
                timeSpent();
                storage(previousDomain, timeOnSite);
            }
        }
    }
    else{
        chrome.tabs.query({currentWindow: true}, function(tabs){
            if(tabs.length === 0){
                console.log("closing last tab");
                timeSpent();
                storage(previousDomain, timeOnSite);                
            }
        });
    }
});
  

function timeSpent(){
    console.log("Calculataing time, idle time is :" + totalIdleTime)
    timeOnSite = (new Date() - startTime) - totalIdleTime;
}

function storage(domainToBeInserted, timeOnDomain){
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
            chrome.storage.local.remove(oldestKey, function(){
                console.log(`Deleted oldest key: ${oldestKey}`);
            });
        }

        // console.log("Number of keys in storage: " + keys.length);

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

        if(domainToBeInserted !== null && domainToBeInserted !== newTab && timeOnDomain !== null){
            let record = {
                domain: domainToBeInserted,
                totalTime: timeOnDomain
            }

            //check if domain exists in the object
            let check = false;
            let stats = result[currentDate]; //retrieve values of key from result object and assign it to stats
            //check if result has an object
            if(stats){
                for(let i = 0; i < stats.length; i++){
                    if(stats[i].domain === domainToBeInserted){
                        stats[i].totalTime += timeOnDomain;
                        check = true;
                        break;
                    }
                }                    
            }else{
                console.log(`${currentDate} object does not exist`);
            }
            
            if(!check){
                stats.push(record);
            }

            chrome.storage.local.set({[currentDate]: stats}, function(){
                // console.log(`Pushed ${record.domain, record.totalTime}  to ${currentDate}`);
                console.log("Pushed " + record.domain + ", " + record.totalTime + " to " + currentDate);
            });       
        }
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

