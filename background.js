// Background script for Twitter AI Assistant

// Initialize default settings on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(
    ['apiType', 'apiKey', 'postInterval', 'twitterApiKey', 'keywords', 'contentStyle', 'isActive'],
    (result) => {
      // Only set defaults for values that don't exist
      const settings = {
        apiType: result.apiType || 'groq',
        apiKey: result.apiKey || '',
        postInterval: result.postInterval || 30,
        twitterApiKey: result.twitterApiKey || '',
        keywords: result.keywords || 'react,nextjs,javascript,webdev,tech,startup,india',
        contentStyle: result.contentStyle || 'professional',
        isActive: result.isActive || false
      };
      
      chrome.storage.sync.set(settings, () => {
        console.log('Default settings initialized');
        
        // Set up initial alarm if extension is active
        if (settings.isActive) {
          setupAlarm(settings.postInterval);
        }
      });
    }
  );
});

// Set up the alarm based on user settings
function setupAlarm() {
  chrome.storage.sync.get(['postInterval', 'isActive'], (result) => {
    // Clear any existing alarms
    chrome.alarms.clearAll();
    
    if (result.isActive) {
      // Convert minutes to milliseconds, handling decimal values for sub-minute intervals
      const intervalInMinutes = parseFloat(result.postInterval) || 30;
      
      // Create a new alarm with the specified interval
      chrome.alarms.create('postSchedule', {
        periodInMinutes: intervalInMinutes
      });
      console.log(`Alarm set to trigger every ${intervalInMinutes} minutes`);
    }
  });
}

// Listen for changes to settings and update alarm if needed
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && (changes.postInterval || changes.isActive)) {
    setupAlarm();
  }
});

// Handle alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'postSchedule') {
    // Check if we're on Twitter before attempting to post
    chrome.tabs.query({active: true, url: ["*://twitter.com/*", "*://x.com/*"]}, (tabs) => {
      if (tabs.length > 0) {
        // We're on Twitter, send message to content script to perform action
        chrome.tabs.sendMessage(tabs[0].id, {action: "performAction"});
      } else {
        // Not on Twitter, try to find an open Twitter tab
        chrome.tabs.query({url: ["*://twitter.com/*", "*://x.com/*"]}, (twitterTabs) => {
          if (twitterTabs.length > 0) {
            // Found a Twitter tab, make it active and send message
            chrome.tabs.update(twitterTabs[0].id, {active: true}, () => {
              chrome.tabs.sendMessage(twitterTabs[0].id, {action: "performAction"});
            });
          } else {
            console.log("No Twitter tabs found. Skipping this scheduled action.");
          }
        });
      }
    });
  }
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateSettings") {
    // Get current settings to check if we need to update the alarm
    chrome.storage.sync.get(
      ['isActive', 'postInterval'],
      (result) => {
        // Update alarm if extension is active or if it was just activated
        if (result.isActive) {
          setupAlarm(result.postInterval);
        } else {
          // Clear alarm if extension is deactivated
          chrome.alarms.clear('twitterAction');
        }
        sendResponse({status: "Settings updated"});
      }
    );
    return true;
  } else if (message.action === "getSettings") {
    // Return current settings to popup
    chrome.storage.sync.get(
      ['apiType', 'apiKey', 'postInterval', 'twitterApiKey', 'keywords', 'contentStyle', 'isActive'],
      (result) => {
        sendResponse(result);
      }
    );
    return true;
  }
});