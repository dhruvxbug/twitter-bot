## Disclaimer

This extension is for educational purposes only. Use responsibly and in accordance with Twitter's terms of service. Automated interactions may violate Twitter's rules, so use at your own risk. (Shadow ban or Twitter (X) warnings -personal experience) 

# Twitter AI Assistant Chrome Extension

A Chrome extension that automates Twitter interactions using AI-generated content focused on Indian tech and software development topics.

## Features

- **Automated Twitter Interactions**: Automatically replies to tweets and creates new posts at regular intervals
- **Multi-API Support**: Compatible with GROQ, Google Gemini, and OpenAI APIs
- **Witty Indian Tech Voice**: Content is tailored with a witty, sarcastic Indian developer tone focused on tech and software development
- **Human-like Behavior**: Simulates human-like scrolling, clicking, and typing to avoid detection
- **Customizable Settings**: Configure API type, API key, post interval, target keywords, and content style

## Installation

### Development Mode

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension should now appear in your Chrome toolbar

### Configuration

1. Click on the extension icon to open the popup
2. Select your preferred AI API (GROQ, Google Gemini, or OpenAI)
3. Enter your API key for the selected service
4. Set the post interval (in minutes)
5. Enter target keywords (comma-separated)
6. Choose your preferred content style
7. Toggle the extension on/off
8. Click "Save Settings"

## Usage

1. Navigate to Twitter (twitter.com or x.com)
2. The extension will automatically interact with tweets containing your target keywords
3. It will either reply to existing tweets or create new posts based on the configured interval
4. All interactions use AI-generated content relevant to Indian tech topics

## Requirements

- Google Chrome browser
- One of the following API keys:
  - GROQ API key (sign up at https://console.groq.com/)
  - Google Gemini API key (get from Google AI Studio)
  - OpenAI API key (sign up at https://platform.openai.com/)
- Active Twitter account

## Privacy & Security

- Your GROQ API key is stored locally in Chrome's secure storage
- The extension only operates on Twitter domains (twitter.com and x.com)
- No data is collected or transmitted to third parties
