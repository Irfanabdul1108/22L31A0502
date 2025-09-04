React URL Shortener

A sleek, modern, and responsive URL shortener application built with React and styled with Tailwind CSS. This single-page application allows users to quickly shorten long URLs, track clicks, and copy the shortened links to their clipboard. A key feature is the 30-minute expiry on all generated links, complete with a live countdown timer.

✨ Features

URL Shortening: Converts long, cumbersome URLs into short and manageable links using the TinyURL API.

30-Minute Link Expiry: Each shortened link is valid for only 30 minutes, enhancing security and privacy.

Live Countdown Timer: A visual timer on each link card shows exactly how much time is remaining before it expires.

Click Tracking: Monitors and displays the number of times each shortened link has been clicked.

Copy to Clipboard: One-click functionality to copy the shortened URL.

Persistent History: Your list of active links is saved in the browser's local storage, so they persist between sessions.

Automatic Cleanup: The application automatically removes expired links from the view and local storage.

Responsive Design: A beautiful and intuitive dark-themed UI that works seamlessly on all devices, from desktops to mobile phones.

Error Handling: Provides clear feedback for invalid URLs or network issues.

🚀 Tech Stack

Frontend: React.js (with Hooks)

Styling: css

API: TinyURL API (for link shortening)

Storage: Browser localStorage API

🔧 How It Works

The application is built as a single, self-contained React component.

Input & Validation: The user enters a long URL into the input field. A simple validation check ensures the URL is in a valid format (i.e., starts with http:// or https://).

API Call: Upon submission, an asynchronous fetch request is made to the tinyurl.com/api-create.php endpoint with the long URL.

State Management: If the API call is successful, a new link object is created. This object includes a unique ID, the original and short URLs, a click count (initialized to 0), and an expiresAt timestamp set to 30 minutes in the future. This new object is added to the shortenedUrls state array.

Expiry Logic:

A useEffect hook runs on a set interval (every 5 seconds) to filter the shortenedUrls array, removing any links where the expiresAt timestamp is in the past.

The separate Timer component takes the expiresAt timestamp as a prop and calculates the remaining minutes and seconds, re-rendering every second to create a live countdown.

Persistence: The shortenedUrls state is synchronized with the browser's localStorage using another useEffect hook. This ensures that the user's active links are saved and reloaded when they revisit the page. Expired links are filtered out upon initial load.

🛠️ Running Locally

This project is a single React component, but it can be easily integrated into a standard Create React App environment.

Prerequisites: Make sure you have Node.js and npm (or yarn) installed.

Set up a React App:

npx create-react-app my-url-shortener
cd my-url-shortener


Install Tailwind CSS: Follow the official guide to install Tailwind CSS in a Create React App project.

Replace App.js: Copy the entire code from the url-shortener.jsx file and replace the contents of src/App.js with it.

Start the development server:

npm start


The application will now be running on http://localhost:3000.