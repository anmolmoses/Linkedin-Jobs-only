# LinkedIn Jobs-Only Extension

A Chrome/Edge browser extension that automatically redirects LinkedIn's Home/Feed pages to the Jobs page, helping you stay focused on job searching instead of getting distracted by social feeds.

## 🎯 What It Does

- **Blocks LinkedIn Home/Feed**: Automatically redirects any attempt to access LinkedIn's home feed
- **Forces Jobs Page**: Always lands you on the Jobs page when visiting LinkedIn
- **Hides Home Button**: Removes the Home button and feed-related UI elements
- **100% Coverage**: Uses multiple layers of protection to ensure no feed content ever loads

## 🚀 Features

- ✅ **Network-level redirects** using Declarative Net Request API
- ✅ **Background script interception** for navigation events
- ✅ **Content script protection** with immediate page redirects
- ✅ **SPA navigation blocking** for single-page app route changes
- ✅ **UI element hiding** with comprehensive CSS selectors
- ✅ **Click event interception** for any missed UI elements
- ✅ **Continuous monitoring** with mutation observers and URL polling
- ✅ **Cache-busting** to prevent cached feed content
- ✅ **Error handling** with graceful fallbacks

## 📁 File Structure

```
linkedin_remove_home/
├── manifest.json          # Extension configuration
├── background.js          # Background script for navigation interception
├── contentScript.js       # Main logic for redirects and UI hiding
├── contentStyles.css      # CSS to hide home/feed elements immediately
├── rules_1.json          # Declarative net request rules
└── README.md             # This file
```

## 🛠️ Local Installation

### Step 1: Download the Extension

1. **Clone or download** this repository to your local machine:

   ```bash
   git clone <your-repo-url>
   # OR download as ZIP and extract
   ```

2. **Navigate to the folder**:
   ```bash
   cd linkedin_remove_home
   ```

### Step 2: Load Extension in Chrome/Edge

#### For Google Chrome:

1. **Open Chrome** and go to `chrome://extensions/`
2. **Enable Developer Mode** (toggle in top-right corner)
3. **Click "Load unpacked"**
4. **Select the `linkedin_remove_home` folder**
5. **Confirm the extension loads** - you should see "LinkedIn Jobs-Only" in your extensions list

#### For Microsoft Edge:

1. **Open Edge** and go to `edge://extensions/`
2. **Enable Developer Mode** (toggle in left sidebar)
3. **Click "Load unpacked"**
4. **Select the `linkedin_remove_home` folder**
5. **Confirm the extension loads** - you should see "LinkedIn Jobs-Only" in your extensions list

### Step 3: Verify Installation

1. **Visit LinkedIn** (https://www.linkedin.com)
2. **You should be automatically redirected** to https://www.linkedin.com/jobs/
3. **Try clicking the LinkedIn logo** - should redirect to jobs page
4. **Check that the Home button is hidden** in the navigation bar

## ✅ Testing the Extension

### Expected Behaviors:

- ✅ Visiting `linkedin.com` → Redirects to `linkedin.com/jobs/`
- ✅ Visiting `linkedin.com/feed/` → Redirects to `linkedin.com/jobs/`
- ✅ Clicking LinkedIn logo → Goes to jobs page
- ✅ Home button in navigation → Hidden/disabled
- ✅ Feed content → Never loads
- ✅ Browser back/forward from feed → Redirects to jobs

### Test These URLs:

```
https://www.linkedin.com/
https://www.linkedin.com/feed/
https://www.linkedin.com/homepage/
https://www.linkedin.com/?trk=homepage
```

All should redirect to the jobs page.

## 🔧 Troubleshooting

### Extension Not Working?

1. **Check if extension is enabled**:

   - Go to `chrome://extensions/` or `edge://extensions/`
   - Ensure "LinkedIn Jobs-Only" is enabled (toggle should be blue)

2. **Reload the extension**:

   - Click the refresh icon on the extension card
   - Or disable/enable the extension

3. **Clear LinkedIn cache**:

   - Go to LinkedIn and press `Ctrl+Shift+R` (hard refresh)
   - Or clear browser cache for linkedin.com

4. **Check browser console**:
   - Press `F12` on LinkedIn
   - Look for any "LinkedIn Jobs-Only" error messages
   - Report issues with console logs

### Still Seeing Feed Content?

1. **Wait a moment** - some elements take time to hide
2. **Refresh the page** - the extension should catch it on reload
3. **Check for updates** - LinkedIn might have changed their UI
4. **Report the issue** with details about what you're seeing

## 🔒 Privacy & Permissions

This extension only:

- ✅ **Runs on LinkedIn.com** - no other websites affected
- ✅ **Redirects URLs locally** - no data sent anywhere
- ✅ **Hides UI elements** - purely cosmetic changes
- ✅ **No data collection** - completely private
- ✅ **No network requests** - works entirely offline

### Required Permissions:

- `tabs` - To redirect LinkedIn tabs to jobs page
- `webNavigation` - To intercept navigation to home/feed
- `scripting` - To run content script on LinkedIn
- `declarativeNetRequest` - To block feed URLs at network level
- `https://www.linkedin.com/*` - Host permission for LinkedIn only

## 🛠️ Development

### Making Changes:

1. **Edit the files** as needed
2. **Go to extensions page** (`chrome://extensions/`)
3. **Click the refresh icon** on the LinkedIn Jobs-Only extension
4. **Test your changes** on LinkedIn

### Key Files:

- **`contentScript.js`** - Main redirect and UI hiding logic
- **`contentStyles.css`** - CSS selectors for hiding elements
- **`rules_1.json`** - Network-level redirect rules
- **`background.js`** - Background navigation interception

### Adding New URL Patterns:

If LinkedIn introduces new feed URLs, add them to:

1. `rules_1.json` (network level)
2. `isFeedOrHome()` functions in `contentScript.js`
3. `shouldRedirectToJobs()` in `background.js`

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. **Fork the repository**
2. **Make your changes**
3. **Test thoroughly on LinkedIn**
4. **Submit a pull request**

## ⚠️ Disclaimer

This extension modifies LinkedIn's user interface and navigation. Use at your own discretion. LinkedIn may update their website structure, which could affect the extension's functionality.

---

**Happy job hunting! 🎯**
