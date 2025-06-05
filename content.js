// Content script for Twitter AI Assistant

// Global variables
let settings = {
  apiKey: '',
  postInterval: 30,
  twitterApiKey: '',
  keywords: 'react,nextjs,javascript,webdev,tech,startup,india',
  contentStyle: 'professional',
  isActive: false
};

// Initialize when content script loads
let initPromise = init();

// Set up message listener for communication with background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "performAction") {
    performRandomAction().then(() => {
      sendResponse({status: "Action performed"});
    }).catch(error => {
      console.error("Error performing action:", error);
      sendResponse({status: "Error", error: error.message});
    });
    return true; // Indicates we will send a response asynchronously
  }
  return true;
});

// Initialize by loading settings
async function init() {
  // Get settings from storage
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      ['apiKey', 'postInterval', 'twitterApiKey', 'keywords', 'contentStyle', 'isActive'],
      (result) => {
        settings = {...settings, ...result};
        console.log("Twitter AI Assistant initialized with settings:", 
          { ...settings, apiKey: settings.apiKey ? "[HIDDEN]" : "Not set" });
        resolve();
      }
    );
  });
}

// Perform a random action - either reply to a tweet or create a new post
async function performRandomAction() {
  // Wait for initialization to complete
  await initPromise;
  
  // First check if we have an API key
  if (!settings.apiKey) {
    console.log("No API key set. Please configure the extension.");
    return;
  }

  // Start with some random mouse movements to appear more natural
  console.log("Starting random mouse movements before action");
  await simulateRandomMouseMovements(3 + Math.floor(Math.random() * 4));
  
  // Decide whether to reply to a tweet or create a new post
  const shouldReply = Math.random() > 0.3; // 70% chance to reply, 30% to post new
  
  // Occasionally perform some extra random actions before the main action
  if (Math.random() < 0.4) {
    console.log("Performing extra random actions to appear more human-like");
    
    // Random scrolling
    if (Math.random() < 0.7) {
      await simulateScrolling();
    }
    
    // Random mouse movements
    await simulateRandomMouseMovements(2 + Math.floor(Math.random() * 3));
    
    // Occasionally hover over random elements
    if (Math.random() < 0.5) {
      await hoverRandomElements();
    }
  }
  
  // Perform the main action
  if (shouldReply) {
    await replyToRandomTweet();
  } else {
    await createNewPost();
  }
  
  // End with some random mouse movements
  console.log("Ending with random mouse movements after action");
  await simulateRandomMouseMovements(2 + Math.floor(Math.random() * 3));
}

// Hover over random elements on the page
async function hoverRandomElements() {
  console.log("Hovering over random elements");
  
  // Find all potentially interactive elements
  const interactiveElements = Array.from(document.querySelectorAll('a, button, [role="button"], [role="link"], [role="tab"]'));
  
  // Filter for visible elements
  const visibleElements = interactiveElements.filter(el => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && 
           rect.top >= 0 && rect.left >= 0 && 
           rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
  });
  
  if (visibleElements.length === 0) {
    console.log("No visible interactive elements found");
    return;
  }
  
  // Select 1-3 random elements to hover over
  const numElements = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numElements && i < visibleElements.length; i++) {
    // Select a random element
    const randomIndex = Math.floor(Math.random() * visibleElements.length);
    const element = visibleElements[randomIndex];
    
    // Remove the selected element to avoid selecting it again
    visibleElements.splice(randomIndex, 1);
    
    // Get element position
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Move mouse to the element (using the same approach as in simulateHumanClick)
    const currentX = window.mouseX || window.innerWidth / 2;
    const currentY = window.mouseY || window.innerHeight / 2;
    
    // Calculate path
    const distance = Math.sqrt(Math.pow(centerX - currentX, 2) + Math.pow(centerY - currentY, 2));
    const steps = Math.max(10, Math.floor(distance / 10));
    
    // Add curve
    const controlX = (currentX + centerX) / 2 + (Math.random() - 0.5) * 100;
    const controlY = (currentY + centerY) / 2 + (Math.random() - 0.5) * 100;
    
    // Move mouse to element
    for (let step = 0; step <= steps; step++) {
      const t = step / steps;
      const oneMinusT = 1 - t;
      const pointX = Math.round(oneMinusT * oneMinusT * currentX + 2 * oneMinusT * t * controlX + t * t * centerX);
      const pointY = Math.round(oneMinusT * oneMinusT * currentY + 2 * oneMinusT * t * controlY + t * t * centerY);
      
      // Create and dispatch mouse move event
      const moveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: pointX,
        clientY: pointY,
        screenX: pointX,
        screenY: pointY
      });
      
      document.dispatchEvent(moveEvent);
      
      // Update global position
      window.mouseX = pointX;
      window.mouseY = pointY;
      
      await sleep(Math.floor(Math.random() * 20) + 5);
    }
    
    // Hover over the element
    element.dispatchEvent(new MouseEvent('mouseover', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: centerX,
      clientY: centerY
    }));
    
    // Hover for a random duration
    await sleep(Math.floor(Math.random() * 2000) + 500);
    
    // Mouse out
    element.dispatchEvent(new MouseEvent('mouseout', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: centerX,
      clientY: centerY
    }));
    
    // Wait between hovering over elements
    await sleep(Math.floor(Math.random() * 1000) + 200);
  }
}

// Find a random tweet to reply to based on keywords
async function replyToRandomTweet() {
  // Simulate human scrolling
  await simulateScrolling();
  
  // Get all tweets on the page - try multiple possible selectors
  let tweets = document.querySelectorAll('[data-testid="tweet"]');
  
  // If the primary selector fails, try alternative selectors
  if (tweets.length === 0) {
    tweets = document.querySelectorAll('[data-testid="tweetText"]').map(el => el.closest('article'));
  }
  
  if (tweets.length === 0) {
    tweets = document.querySelectorAll('article');
  }
  
  if (tweets.length === 0) {
    console.log("No tweets found on the page using any selector");
    return;
  }
  
  // Convert NodeList to Array for filtering
  const tweetsArray = Array.from(tweets).filter(tweet => tweet !== null);
  console.log(`Found ${tweetsArray.length} tweets on the page`);
  
  // Filter tweets containing our keywords
  const keywordArray = settings.keywords.split(',').map(k => k.trim().toLowerCase());
  const relevantTweets = tweetsArray.filter(tweet => {
    const tweetText = tweet.textContent.toLowerCase();
    return keywordArray.some(keyword => tweetText.includes(keyword));
  });
  
  if (relevantTweets.length === 0) {
    console.log("No relevant tweets found containing keywords");
    return;
  }
  
  console.log(`Found ${relevantTweets.length} relevant tweets containing keywords`);
  
  // Select a random relevant tweet
  const randomIndex = Math.floor(Math.random() * relevantTweets.length);
  const selectedTweet = relevantTweets[randomIndex];
  
  // Extract tweet text - try multiple possible selectors
  let tweetTextElement = selectedTweet.querySelector('[data-testid="tweetText"]');
  if (!tweetTextElement) {
    tweetTextElement = selectedTweet.querySelector('div[lang]'); // Twitter often uses lang attribute on tweet text
  }
  
  const tweetText = tweetTextElement ? tweetTextElement.textContent : "";
  
  if (!tweetText) {
    console.log("Could not extract tweet text");
    return;
  }
  
  console.log("Found tweet with text:", tweetText.substring(0, 50) + "...");
  
  // Generate AI reply
  const reply = await generateAIResponse(tweetText, true);
  console.log("Generated reply:", reply);
  
  // Find reply button - try multiple possible selectors
  let replyButton = selectedTweet.querySelector('[data-testid="reply"]');
  if (!replyButton) {
    // Try to find by aria-label
    const possibleReplyButtons = Array.from(selectedTweet.querySelectorAll('div[role="button"]'));
    replyButton = possibleReplyButtons.find(btn => {
      const ariaLabel = btn.getAttribute('aria-label');
      return ariaLabel && (ariaLabel.toLowerCase().includes('reply') || ariaLabel.toLowerCase().includes('respond'));
    });
  }
  
  if (!replyButton) {
    console.log("Reply button not found using any selector");
    return;
  }
  
  // Simulate human-like click
  await simulateHumanClick(replyButton);
  console.log("Clicked reply button");
  
  // Wait for reply dialog to appear
  await sleep(3000); // Increased wait time
  
  // Find the reply input field - try multiple possible selectors
  let replyInput = document.querySelector('[data-testid="tweetTextarea_0"]');
  if (!replyInput) {
    replyInput = document.querySelector('div[contenteditable="true"]');
  }
  if (!replyInput) {
    replyInput = document.querySelector('div[role="textbox"]');
  }
  
  if (!replyInput) {
    console.log("Reply input not found using any selector");
    return;
  }
  
  console.log("Found reply input field");
  
  // Type the reply with human-like timing
  await simulateTyping(replyInput, reply);
  console.log("Typed reply text");
  
  // Find and click the reply button - try multiple possible selectors
  let submitButton = document.querySelector('[data-testid="tweetButton"]');
  if (!submitButton) {
    // Try to find by text content with more variations
    const possibleButtons = Array.from(document.querySelectorAll('div[role="button"], button, span[role="button"]'));
    submitButton = possibleButtons.find(btn => {
      const text = btn.textContent.toLowerCase();
      return text.includes('reply') || text.includes('tweet') || text.includes('post') || text.includes('send');
    });
  }
  
  // Try finding by aria-label
  if (!submitButton) {
    const ariaLabelButtons = Array.from(document.querySelectorAll('[aria-label]'));
    submitButton = ariaLabelButtons.find(btn => {
      const label = btn.getAttribute('aria-label')?.toLowerCase() || '';
      return label.includes('reply') || label.includes('tweet') || label.includes('post') || label.includes('send');
    });
  }
  
  // Try finding by position relative to the input field
  if (!submitButton && replyInput) {
    // Look for buttons in the same form or container as the input
    const container = replyInput.closest('form') || replyInput.closest('div[role="dialog"]') || replyInput.parentElement.parentElement;
    if (container) {
      const containerButtons = Array.from(container.querySelectorAll('div[role="button"], button'));
      // Usually the reply button is one of the last buttons in the container
      if (containerButtons.length > 0) {
        // Try the last few buttons, as the reply button is often at the end
        for (let i = containerButtons.length - 1; i >= Math.max(0, containerButtons.length - 3); i--) {
          const btn = containerButtons[i];
          const style = window.getComputedStyle(btn);
          // Reply buttons often have a distinctive background color
          if (style.backgroundColor && style.backgroundColor !== 'transparent' && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            submitButton = btn;
            break;
          }
        }
      }
    }
  }
  
  if (!submitButton) {
    console.log("Submit button not found using any selector");
    // Take a screenshot of the DOM for debugging
    console.log("Current DOM structure:", document.body.innerHTML.substring(0, 1000) + "...");
    return;
  }
  
  console.log("Found submit button:", submitButton.outerHTML);
  
  // Check if the button is disabled using multiple methods
  const isDisabled = submitButton.getAttribute('aria-disabled') === 'true' || 
                  submitButton.disabled === true ||
                  submitButton.classList.contains('disabled') ||
                  getComputedStyle(submitButton).opacity < 0.5 ||
                  getComputedStyle(submitButton).cursor === 'not-allowed' ||
                  getComputedStyle(submitButton).pointerEvents === 'none';
  
  if (isDisabled) {
    console.log("Submit button is disabled, cannot click. Button state:", {
      'aria-disabled': submitButton.getAttribute('aria-disabled'),
      'disabled': submitButton.disabled,
      'classes': submitButton.className,
      'opacity': getComputedStyle(submitButton).opacity,
      'cursor': getComputedStyle(submitButton).cursor,
      'pointerEvents': getComputedStyle(submitButton).pointerEvents
    });
    
    // Try to enable the button by simulating text input again
    if (replyInput) {
      console.log("Trying to trigger input events again to enable the button");
      replyInput.dispatchEvent(new Event('input', { bubbles: true }));
      replyInput.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(1000);
      
      // Check if button is now enabled
      const isStillDisabled = submitButton.getAttribute('aria-disabled') === 'true' || 
                            submitButton.disabled === true ||
                            submitButton.classList.contains('disabled') ||
                            getComputedStyle(submitButton).opacity < 0.5;
      
      if (isStillDisabled) {
        console.log("Button is still disabled after retry");
        return;
      }
    } else {
      return;
    }
  }
  
  // Try multiple click methods to ensure the button is clicked
  console.log("Attempting to click submit button with multiple methods");
  
  // Method 1: Use our simulateHumanClick function
  await simulateHumanClick(submitButton);
  
  // Method 2: Direct click
  try {
    console.log("Trying direct click");
    submitButton.click();
    await sleep(1000);
  } catch (e) {
    console.log("Direct click failed:", e);
  }
  
  // Method 3: Try clicking any child elements that might be the actual clickable part
  const clickableChildren = submitButton.querySelectorAll('*');
  for (const child of clickableChildren) {
    try {
      console.log("Trying to click child element");
      child.click();
      await sleep(500);
    } catch (e) {}
  }
  
  console.log("All click methods attempted on submit button");
  
  // Wait longer to ensure the reply is posted
  await sleep(5000);
  
  console.log("Successfully replied to tweet");
}

// Create a new post
async function createNewPost() {
  // Generate AI content for a new post
  const postContent = await generateAIResponse("", false);
  console.log("Generated new post content:", postContent);
  
  // Find the compose tweet button - try multiple possible selectors
  let composeButton = document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
  
  if (!composeButton) {
    // Try alternative selectors
    const possibleButtons = Array.from(document.querySelectorAll('a[role="button"], div[role="button"]'));
    composeButton = possibleButtons.find(btn => {
      const ariaLabel = btn.getAttribute('aria-label');
      const text = btn.textContent.toLowerCase();
      return (ariaLabel && ariaLabel.toLowerCase().includes('tweet')) || 
             text.includes('tweet') || 
             text.includes('post');
    });
  }
  
  if (!composeButton) {
    // Try the floating action button which is often used for compose
    composeButton = document.querySelector('a[href="/compose/tweet"]');
  }
  
  if (!composeButton) {
    console.log("Compose button not found using any selector");
    return;
  }
  
  console.log("Found compose button");
  
  // Click the compose button
  await simulateHumanClick(composeButton);
  console.log("Clicked compose button");
  
  // Wait for the compose dialog to appear
  await sleep(3000); // Increased wait time
  
  // Find the tweet input field - try multiple possible selectors
  let tweetInput = document.querySelector('[data-testid="tweetTextarea_0"]');
  if (!tweetInput) {
    tweetInput = document.querySelector('div[contenteditable="true"]');
  }
  if (!tweetInput) {
    tweetInput = document.querySelector('div[role="textbox"]');
  }
  
  if (!tweetInput) {
    console.log("Tweet input not found using any selector");
    return;
  }
  
  console.log("Found tweet input field");
  
  // Type the tweet with human-like timing
  await simulateTyping(tweetInput, postContent);
  console.log("Typed tweet content");
  
  // Find and click the tweet button - try multiple possible selectors
  let tweetButton = document.querySelector('[data-testid="tweetButton"]');
  if (!tweetButton) {
    // Try to find by text content with more variations
    const possibleButtons = Array.from(document.querySelectorAll('div[role="button"], button, span[role="button"]'));
    tweetButton = possibleButtons.find(btn => {
      const text = btn.textContent.toLowerCase();
      return text.includes('tweet') || text.includes('post') || text.includes('reply') || text.includes('send');
    });
  }
  
  // Try finding by aria-label
  if (!tweetButton) {
    const ariaLabelButtons = Array.from(document.querySelectorAll('[aria-label]'));
    tweetButton = ariaLabelButtons.find(btn => {
      const label = btn.getAttribute('aria-label').toLowerCase();
      return label.includes('tweet') || label.includes('post') || label.includes('reply') || label.includes('send');
    });
  }
  
  // Try finding by position relative to the input field
  if (!tweetButton && tweetInput) {
    // Look for buttons in the same form or container as the input
    const container = tweetInput.closest('form') || tweetInput.closest('div[role="dialog"]') || tweetInput.parentElement.parentElement;
    if (container) {
      const containerButtons = Array.from(container.querySelectorAll('div[role="button"], button'));
      // Usually the tweet button is one of the last buttons in the container
      if (containerButtons.length > 0) {
        // Try the last few buttons, as the tweet button is often at the end
        for (let i = containerButtons.length - 1; i >= Math.max(0, containerButtons.length - 3); i--) {
          const btn = containerButtons[i];
          const style = window.getComputedStyle(btn);
          // Tweet buttons often have a distinctive background color
          if (style.backgroundColor && style.backgroundColor !== 'transparent' && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            tweetButton = btn;
            break;
          }
        }
      }
    }
  }
  
  if (!tweetButton) {
    console.log("Tweet button not found using any selector");
    // Take a screenshot of the DOM for debugging
    console.log("Current DOM structure:", document.body.innerHTML.substring(0, 1000) + "...");
    return;
  }
  
  console.log("Found tweet button:", tweetButton.outerHTML);
  
  // Check if the button is disabled using multiple methods
  const isDisabled = tweetButton.getAttribute('aria-disabled') === 'true' || 
                  tweetButton.disabled === true ||
                  tweetButton.classList.contains('disabled') ||
                  getComputedStyle(tweetButton).opacity < 0.5 ||
                  getComputedStyle(tweetButton).cursor === 'not-allowed' ||
                  getComputedStyle(tweetButton).pointerEvents === 'none';
  
  if (isDisabled) {
    console.log("Tweet button is disabled, cannot click. Button state:", {
      'aria-disabled': tweetButton.getAttribute('aria-disabled'),
      'disabled': tweetButton.disabled,
      'classes': tweetButton.className,
      'opacity': getComputedStyle(tweetButton).opacity,
      'cursor': getComputedStyle(tweetButton).cursor,
      'pointerEvents': getComputedStyle(tweetButton).pointerEvents
    });
    
    // Try to enable the button by simulating text input again
    if (tweetInput) {
      console.log("Trying to trigger input events again to enable the button");
      tweetInput.dispatchEvent(new Event('input', { bubbles: true }));
      tweetInput.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(1000);
      
      // Check if button is now enabled
      const isStillDisabled = tweetButton.getAttribute('aria-disabled') === 'true' || 
                            tweetButton.disabled === true ||
                            tweetButton.classList.contains('disabled') ||
                            getComputedStyle(tweetButton).opacity < 0.5;
      
      if (isStillDisabled) {
        console.log("Button is still disabled after retry");
        return;
      }
    } else {
      return;
    }
  }
  
  // Try multiple click methods to ensure the button is clicked
  console.log("Attempting to click tweet button with multiple methods");
  
  // Method 1: Use our simulateHumanClick function
  await simulateHumanClick(tweetButton);
  
  // Method 2: Direct click
  try {
    console.log("Trying direct click");
    tweetButton.click();
    await sleep(1000);
  } catch (e) {
    console.log("Direct click failed:", e);
  }
  
  // Method 3: Try clicking any child elements that might be the actual clickable part
  const clickableChildren = tweetButton.querySelectorAll('*');
  for (const child of clickableChildren) {
    try {
      console.log("Trying to click child element");
      child.click();
      await sleep(500);
    } catch (e) {}
  }
  
  console.log("All click methods attempted on tweet button");
  
  // Wait longer to ensure the tweet is posted
  await sleep(5000);
  
  console.log("Successfully created new post");
}

// Generate AI response using selected API (GROQ, Gemini, or others)
async function generateAIResponse(tweetText, isReply) {
  try {
    // Check if API key is available
    if (!settings.apiKey) {
      console.error("No API key available. Please set an API key in the extension settings.");
      return isReply 
        ? "Interesting point! I'd love to discuss this further from an Indian tech perspective. *sips chai* ☕️"
        : "Just thinking about how React and Next.js are transforming the Indian tech ecosystem. Bangalore devs, you feel me? #IndianTech #WebDev #ReactJS";
    }
    
    // Enhanced AI style prompt for generating witty, tech-savvy Indian developer content
    const systemPrompt = `You are a witty, sharp, and slightly sarcastic Indian software developer on Tech Twitter. 
Your tone blends tech savviness, meme energy, and occasional real insights from the world of React, Next.js, full-stack development, startup life, and developer culture.

Write short, clever, and contextually relevant tweet replies or standalone tweets based on the input text or tweet.

Your style should include:
🔧 Tech references (React, TypeScript, AI, Next.js, Web3, open-source)
😂 Memeable humor or sarcasm (like "We deploy on Fridays because we like to live dangerously.")
🤏 Brevity (Tweet-length: 1–3 lines max)
🇮🇳 Indian dev culture flavor (think chai breaks, Jugaad, Bangalore startup grind, etc.)

Types of content to generate:
- Funny or sarcastic takes on the original tweet
- Tech hot takes or useful insights disguised as jokes
- Casual developer commentary (like you're talking to dev friends on Twitter)

Examples of your tone:
"React developers when someone mentions vanilla JS: sips strongly typed chai ☕️"
"Next.js 14 dropped. Time to rebuild the same blog with 3 more routers."
"Yes, I'm full stack. I can stress about both frontend and backend at the same time."
"You don't deploy on Friday? Bro, I debug in production — it builds character."
"Web3 is dead? Wait till you see my 13th NFT-funded side project."

When replying to tweets, keep it snappy and context-aware. If the tweet is technical, add a sharp insight or twist. If it's casual, match the energy or mock it lightly.

Default to humorous, unless the post is serious or thought-provoking, in which case, drop a crisp, clever dev take.`;
    
    const userPrompt = isReply 
      ? `You are responding to this tweet: "${tweetText}". Write a relevant, witty reply in a ${settings.contentStyle} tone. Keep it under 280 characters.`
      : `Write an original tweet about tech in a ${settings.contentStyle} tone. Include relevant hashtags. Keep it under 280 characters.`;
    
    // If Twitter API key is available, use it for enhanced functionality
    if (settings.twitterApiKey) {
      // This is a placeholder for Twitter API integration
      // In a real implementation, you would use the Twitter API to get more context
      // about the tweet, the user, trending topics, etc.
      console.log("Using Twitter API for enhanced functionality");
      
      // For now, we'll just continue with the regular AI response
    }
    
    // Safely get the lowercase API key
    const apiKeyLower = settings.apiKey.toLowerCase();
    
    // GROQ API call
    if (apiKeyLower.startsWith('gsk_') || apiKeyLower.includes('groq')) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          max_tokens: 150,
          temperature: 0.8
        })
      });

      const data = await response.json();
      return data.choices[0].message.content.trim();
    }
    // Gemini API call
    else if (apiKeyLower.startsWith('aig_') || apiKeyLower.includes('gemini')) {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': settings.apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: systemPrompt + "\n\n" + userPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 150,
            topP: 0.95
          }
        })
      });

      const data = await response.json();
      return data.candidates[0].content.parts[0].text.trim();
    }
    // OpenAI API call (fallback)
    else {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          max_tokens: 150,
          temperature: 0.8
        })
      });

      const data = await response.json();
      return data.choices[0].message.content.trim();
    }
  } catch (error) {
    console.error("Error generating AI response:", error);
    return isReply 
      ? "Interesting point! I'd love to discuss this further from an Indian tech perspective. *sips chai* ☕️"
      : "Just thinking about how React and Next.js are transforming the Indian tech ecosystem. Bangalore devs, you feel me? #IndianTech #WebDev #ReactJS";
  }
}

// Simulate human-like scrolling with random mouse movements
async function simulateScrolling() {
  const scrollAmount = Math.floor(Math.random() * 1000) + 500;
  const duration = Math.floor(Math.random() * 3000) + 2000;
  const steps = Math.floor(duration / 50);
  const stepSize = scrollAmount / steps;
  
  // Perform random mouse movements before scrolling
  await simulateRandomMouseMovements(3 + Math.floor(Math.random() * 3));
  
  for (let i = 0; i < steps; i++) {
    window.scrollBy(0, stepSize);
    await sleep(50);
    
    // Occasionally move the mouse while scrolling
    if (Math.random() < 0.2) {
      await simulateRandomMouseMovements(1);
    }
  }
  
  // Perform random mouse movements after scrolling
  await simulateRandomMouseMovements(2 + Math.floor(Math.random() * 2));
  
  // Pause after scrolling
  await sleep(Math.floor(Math.random() * 1000) + 500);
}

// Simulate human-like clicking with natural mouse movement
async function simulateHumanClick(element) {
  if (!element || !element.getBoundingClientRect) {
    console.error("Invalid element for click simulation");
    return;
  }

  // Make sure the element is visible and in the viewport
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    console.error("Element has zero dimensions, cannot click");
    return;
  }

  // Scroll element into view if needed
  if (rect.bottom < 0 || rect.top > window.innerHeight) {
    // Perform some random mouse movements before scrolling
    await simulateRandomMouseMovements(1 + Math.floor(Math.random() * 2));
    
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await sleep(500); // Wait for scroll to complete
    
    // More random movements after scrolling
    await simulateRandomMouseMovements(1);
  }
  
  // Get updated position after potential scrolling
  const updatedRect = element.getBoundingClientRect();
  const centerX = updatedRect.left + updatedRect.width / 2;
  const centerY = updatedRect.top + updatedRect.height / 2;
  
  // Add slight randomness to click position
  const offsetX = (Math.random() - 0.5) * (updatedRect.width * 0.5);
  const offsetY = (Math.random() - 0.5) * (updatedRect.height * 0.5);
  const clickX = centerX + offsetX;
  const clickY = centerY + offsetY;
  
  // Get current mouse position or use viewport center
  const currentX = window.mouseX || window.innerWidth / 2;
  const currentY = window.mouseY || window.innerHeight / 2;
  
  // Calculate path from current position to element
  const distance = Math.sqrt(Math.pow(clickX - currentX, 2) + Math.pow(clickY - currentY, 2));
  const steps = Math.max(10, Math.floor(distance / 10));
  
  // Add slight curve to movement (more human-like)
  const controlX = (currentX + clickX) / 2 + (Math.random() - 0.5) * 100;
  const controlY = (currentY + clickY) / 2 + (Math.random() - 0.5) * 100;
  
  // Move mouse to element in steps
  for (let step = 0; step <= steps; step++) {
    // Calculate position along curve using quadratic Bezier formula
    const t = step / steps;
    const oneMinusT = 1 - t;
    const pointX = Math.round(oneMinusT * oneMinusT * currentX + 2 * oneMinusT * t * controlX + t * t * clickX);
    const pointY = Math.round(oneMinusT * oneMinusT * currentY + 2 * oneMinusT * t * controlY + t * t * clickY);
    
    // Create and dispatch mouse move event
    const moveEvent = new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: pointX,
      clientY: pointY,
      screenX: pointX,
      screenY: pointY
    });
    
    // Dispatch on document
    document.dispatchEvent(moveEvent);
    
    // Store current position globally
    window.mouseX = pointX;
    window.mouseY = pointY;
    
    // Variable delay between movements
    const delay = Math.floor(Math.random() * 20) + 5; // 5-25ms
    await sleep(delay);
  }
  
  // Create and dispatch mouse events in sequence
  const eventOptions = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: clickX,
    clientY: clickY,
    screenX: clickX,
    screenY: clickY
  };
  
  // Slow down as we approach the element (deceleration)
  await sleep(Math.floor(Math.random() * 200) + 100);
  
  // Mouse over
  element.dispatchEvent(new MouseEvent('mouseover', eventOptions));
  await sleep(Math.floor(Math.random() * 100) + 50);
  
  // Mouse move (final positioning)
  element.dispatchEvent(new MouseEvent('mousemove', eventOptions));
  await sleep(Math.floor(Math.random() * 100) + 50);
  
  // Mouse down
  element.dispatchEvent(new MouseEvent('mousedown', eventOptions));
  await sleep(Math.floor(Math.random() * 100) + 50);
  
  // Focus (important for buttons)
  element.focus();
  await sleep(Math.floor(Math.random() * 50) + 25);
  
  // Mouse up
  element.dispatchEvent(new MouseEvent('mouseup', eventOptions));
  await sleep(Math.floor(Math.random() * 50) + 25);
  
  // Click - both programmatic and event
  element.click(); // Programmatic click
  element.dispatchEvent(new MouseEvent('click', eventOptions)); // Event click
  
  // Wait after clicking
  await sleep(Math.floor(Math.random() * 500) + 200);
  
  // Mouse out
  element.dispatchEvent(new MouseEvent('mouseout', eventOptions));
  
  // Additional wait to ensure the click is processed
  await sleep(1000);
  
  console.log("Click simulated on element with natural mouse movement:", element);
}

// Simulate human-like typing
async function simulateTyping(element, text) {
  // Focus the element
  element.focus();
  
  // Clear any existing text first
  element.textContent = '';
  
  // Type each character with variable timing
  for (let i = 0; i < text.length; i++) {
    // Calculate a random delay between keystrokes (30-100ms)
    const delay = Math.floor(Math.random() * 70) + 30;
    
    // Create and dispatch proper keyboard events
    const char = text[i];
    const keyCode = char.charCodeAt(0);
    
    // KeyDown event
    const keyDownEvent = new KeyboardEvent('keydown', {
      key: char,
      code: 'Key' + char.toUpperCase(),
      keyCode: keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true,
      view: window
    });
    element.dispatchEvent(keyDownEvent);
    
    // Update the content - this is the key part
    // For contentEditable divs (which Twitter uses)
    if (element.isContentEditable) {
      // Insert text at cursor position
      document.execCommand('insertText', false, char);
    } else {
      // For regular inputs
      const oldValue = element.value;
      element.value = oldValue + char;
    }
    
    // Input event
    const inputEvent = new Event('input', {
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(inputEvent);
    
    // KeyUp event
    const keyUpEvent = new KeyboardEvent('keyup', {
      key: char,
      code: 'Key' + char.toUpperCase(),
      keyCode: keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true,
      view: window
    });
    element.dispatchEvent(keyUpEvent);
    
    // Wait before typing the next character
    await sleep(delay);
    
    // Occasionally pause for a longer time (simulating thinking)
    if (Math.random() < 0.1) {
      await sleep(Math.floor(Math.random() * 500) + 200);
    }
  }
  
  // Wait after finishing typing
  await sleep(Math.floor(Math.random() * 1000) + 500);
  
  // Dispatch a change event at the end
  const changeEvent = new Event('change', {
    bubbles: true,
    cancelable: true
  });
  element.dispatchEvent(changeEvent);
}

// Simulate random mouse movements across the page
async function simulateRandomMouseMovements(numMovements = 5) {
  console.log(`Simulating ${numMovements} random mouse movements`);
  
  // Create a hidden div to track mouse position if it doesn't exist
  let mouseTracker = document.getElementById('mouse-movement-tracker');
  if (!mouseTracker) {
    mouseTracker = document.createElement('div');
    mouseTracker.id = 'mouse-movement-tracker';
    mouseTracker.style.position = 'fixed';
    mouseTracker.style.top = '0';
    mouseTracker.style.left = '0';
    mouseTracker.style.width = '1px';
    mouseTracker.style.height = '1px';
    mouseTracker.style.pointerEvents = 'none';
    mouseTracker.style.opacity = '0';
    mouseTracker.style.zIndex = '-9999';
    document.body.appendChild(mouseTracker);
  }
  
  // Get current viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Get current mouse position or use viewport center as starting point
  let currentX = window.mouseX || viewportWidth / 2;
  let currentY = window.mouseY || viewportHeight / 2;
  
  // Perform random mouse movements
  for (let i = 0; i < numMovements; i++) {
    // Generate random target coordinates within viewport
    const targetX = Math.floor(Math.random() * (viewportWidth - 100)) + 50; // Keep away from edges
    const targetY = Math.floor(Math.random() * (viewportHeight - 100)) + 50; // Keep away from edges
    
    // Calculate distance and determine number of steps based on distance
    const distance = Math.sqrt(Math.pow(targetX - currentX, 2) + Math.pow(targetY - currentY, 2));
    const steps = Math.max(10, Math.floor(distance / 10)); // At least 10 steps, more for longer distances
    
    // Add slight randomness to movement path (Bezier-like curve)
    const controlX = (currentX + targetX) / 2 + (Math.random() - 0.5) * 100;
    const controlY = (currentY + targetY) / 2 + (Math.random() - 0.5) * 100;
    
    // Move mouse in steps
    for (let step = 0; step <= steps; step++) {
      // Calculate position along curve using quadratic Bezier formula
      const t = step / steps;
      const oneMinusT = 1 - t;
      const pointX = Math.round(oneMinusT * oneMinusT * currentX + 2 * oneMinusT * t * controlX + t * t * targetX);
      const pointY = Math.round(oneMinusT * oneMinusT * currentY + 2 * oneMinusT * t * controlY + t * t * targetY);
      
      // Create and dispatch mouse events
      const moveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: pointX,
        clientY: pointY,
        screenX: pointX,
        screenY: pointY
      });
      
      // Dispatch event on document and update tracker
      document.dispatchEvent(moveEvent);
      mouseTracker.style.left = `${pointX}px`;
      mouseTracker.style.top = `${pointY}px`;
      
      // Store current position globally
      window.mouseX = pointX;
      window.mouseY = pointY;
      
      // Add variable delay between movements (more human-like)
      const delay = Math.floor(Math.random() * 20) + 5; // 5-25ms
      await sleep(delay);
    }
    
    // Update current position
    currentX = targetX;
    currentY = targetY;
    
    // Pause between major movements
    await sleep(Math.floor(Math.random() * 300) + 100);
    
    // Occasionally hover over elements
    if (Math.random() < 0.3) {
      // Find elements at current position
      const elementsAtPoint = document.elementsFromPoint(currentX, currentY);
      
      // Filter for interactive elements
      const interactiveElements = elementsAtPoint.filter(el => {
        const tagName = el.tagName.toLowerCase();
        return tagName === 'a' || tagName === 'button' || 
               el.getAttribute('role') === 'button' || 
               getComputedStyle(el).cursor === 'pointer';
      });
      
      // If found interactive element, hover over it
      if (interactiveElements.length > 0) {
        const element = interactiveElements[0];
        element.dispatchEvent(new MouseEvent('mouseover', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: currentX,
          clientY: currentY
        }));
        
        // Hover for a random duration
        await sleep(Math.floor(Math.random() * 1000) + 200);
        
        // Mouse out
        element.dispatchEvent(new MouseEvent('mouseout', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: currentX,
          clientY: currentY
        }));
      }
    }
  }
}

// Helper function for sleeping
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}