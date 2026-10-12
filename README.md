# VidTube

A responsive, YouTube-inspired web app built with React. It shows live video data from the YouTube Data API v3.

**Live demo:** https://vidtube-zs.vercel.app/

<!-- Add 2 screenshots here (home page in dark mode, search results). Example:
![Home page](./screenshots/home.png)
-->

## Features

- Search with live suggestions and saved search history
- Subscriptions, liked videos, and watch later
- Notifications and a user profile
- Multiple video categories
- Light and dark mode
- Animated loading skeletons while data loads
- Mobile-friendly, responsive layout

## Tech Stack

- React
- YouTube Data API v3
- Deployed on Vercel

## Getting Started

1. Clone the repository

   ```bash
   git clone https://github.com/zaidkamran327/vidtube-react.git
   cd vidtube-react
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Add your YouTube Data API key

   Create a `.env` file in the project root. Use the same variable name your code reads:

   ```
   YOUR_VARIABLE_NAME=your_youtube_api_key
   ```

   You can create a free API key in the Google Cloud Console by enabling "YouTube Data API v3".

4. Start the app

   ```bash
   npm start
   ```

   If your project uses Vite, use `npm run dev` instead.

## Author

**Zaid Kamran**: BBIT student at UET Lahore, full stack web developer.

- GitHub: https://github.com/zaidkamran327/
- LinkedIn: https://www.linkedin.com/in/zaid-kamran/
