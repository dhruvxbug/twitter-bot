// Popup script for Twitter AI Assistant

// DOM elements
const apiTypeSelect = document.getElementById('apiType');
const apiKeyInput = document.getElementById('apiKey');
const postIntervalInput = document.getElementById('postInterval');
const keywordsInput = document.getElementById('keywords');
const contentStyleSelect = document.getElementById('contentStyle');
const isActiveToggle = document.getElementById('isActive');
const saveButton = document.getElementById('saveButton');
const statusElement = document.getElementById('status');

// Load saved settings when popup opens
document.addEventListener('DOMContentLoaded', loadSettings);

// Add event listener for save button
saveButton.addEventListener('click', saveSettings);

// Load settings from storage
function loadSettings() {
  chrome.runtime.sendMessage({action: "getSettings"}, (response) => {
    if (response) {
      // Set API type based on stored value or detect from API key format
      if (response.apiType) {
        apiTypeSelect.value = response.apiType;
      } else if (response.apiKey) {
        // Try to detect API type from key format
        const apiKey = response.apiKey.toLowerCase();
        if (apiKey.startsWith('gsk_') || apiKey.includes('groq')) {
          apiTypeSelect.value = 'groq';
        } else if (apiKey.startsWith('aig_') || apiKey.includes('gemini')) {
          apiTypeSelect.value = 'gemini';
        } else {
          apiTypeSelect.value = 'openai';
        }
      }
      
      apiKeyInput.value = response.apiKey || '';
      postIntervalInput.value = response.postInterval || 30;
      document.getElementById('twitterApiKey').value = response.twitterApiKey || '';
      keywordsInput.value = response.keywords || 'react,nextjs,javascript,webdev,tech,startup,india';
      contentStyleSelect.value = response.contentStyle || 'professional';
      isActiveToggle.checked = response.isActive || false;
      
      // Update placeholder based on selected API
      updateApiKeyPlaceholder();
    }
  });
}

// Update API key input placeholder based on selected API type
function updateApiKeyPlaceholder() {
  const apiType = apiTypeSelect.value;
  switch (apiType) {
    case 'groq':
      apiKeyInput.placeholder = 'Enter your GROQ API key (starts with gsk_)';
      break;
    case 'gemini':
      apiKeyInput.placeholder = 'Enter your Google Gemini API key';
      break;
    case 'openai':
      apiKeyInput.placeholder = 'Enter your OpenAI API key (starts with sk-)';
      break;
    default:
      apiKeyInput.placeholder = 'Enter your API key';
  }
}

// Add event listener for API type change
apiTypeSelect.addEventListener('change', updateApiKeyPlaceholder);

// Save settings to storage
function saveSettings() {
  // Validate inputs
  if (!validateInputs()) {
    return;
  }
  
  // Get values from form
  const settings = {
    apiType: apiTypeSelect.value,
    apiKey: apiKeyInput.value.trim(),
    postInterval: parseFloat(postIntervalInput.value) || 30,
    twitterApiKey: document.getElementById('twitterApiKey').value.trim(),
    keywords: keywordsInput.value.trim(),
    contentStyle: contentStyleSelect.value,
    isActive: isActiveToggle.checked
  };
  
  // Save to Chrome storage
  chrome.storage.sync.set(settings, () => {
    // Notify background script to update settings
    chrome.runtime.sendMessage({action: "updateSettings"}, (response) => {
      showStatus('Settings saved successfully!', 'success');
    });
  });
}

// Validate form inputs
function validateInputs() {
  // Clear previous status
  statusElement.textContent = '';
  statusElement.className = 'status';
  
  // Check if API key is provided when extension is active
  if (isActiveToggle.checked && !apiKeyInput.value.trim()) {
    showStatus(`Please enter your ${apiTypeSelect.options[apiTypeSelect.selectedIndex].text} key to enable the assistant.`, 'error');
    return false;
  }
  
  // Validate post interval (between 0.5 and 1440 minutes)
  const interval = parseFloat(postIntervalInput.value);
  if (isNaN(interval) || interval < 0.5 || interval > 1440) {
    showStatus('Post interval must be between 30 seconds (0.5) and 1440 minutes.', 'error');
    return false;
  }
  
  // Validate keywords
  if (!keywordsInput.value.trim()) {
    showStatus('Please enter at least one keyword.', 'error');
    return false;
  }
  
  return true;
}

// Show status message
function showStatus(message, type) {
  statusElement.textContent = message;
  statusElement.className = `status ${type}`;
  
  // Clear status after 3 seconds
  setTimeout(() => {
    statusElement.textContent = '';
    statusElement.className = 'status';
  }, 3000);
}