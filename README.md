# 🚀 DevPulse

![DevPulse Banner](https://raw.githubusercontent.com/pradeepmalii/DevPulse/master/src/assets/devpulse_banner.png)

DevPulse is an advanced, high-performance GitHub profile visualizer. Built with a sleek "Matrix Hacker" terminal aesthetic, it goes beyond the standard GitHub contribution graph by transforming raw developer data into immersive, interactive data visualizations using D3.js and the HTML5 Canvas API.

## ✨ Features

- **The Galaxy View:** A custom HTML5 Canvas animation that maps a user's repositories as orbiting planets in a solar system, scaled by size and activity.
- **The Pulse View:** Advanced D3.js data visualizations featuring a 52-week contribution heatmap and a real-time radial "Commit Clock" mapping activity by hour.
- **The Collabs View:** A D3 Force-Directed Graph that visualizes a user's network by crawling their repositories and linking them with their recent co-contributors.
- **Live GitHub Integration:** Seamlessly fetches real-time data using the GitHub REST API and handles complex data aggregations and pagination under the hood.
- **Matrix Aesthetic:** A custom, fully responsive UI built with Tailwind CSS, featuring pitch-black backgrounds, stark white typography, and custom glowing neon green D3 interpolators.

## 🛠️ Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Data Visualization:** D3.js (Force Layouts, Scales, Selections) & HTML5 Canvas API
- **Data Source:** GitHub REST API (Octokit)

## 🚀 Running Locally

To run DevPulse on your local machine, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/YOUR-USERNAME/DevPulse.git
cd DevPulse
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup GitHub Personal Access Token
Because DevPulse makes heavily paginated requests to the GitHub API (especially for the Collabs view), you must use a Personal Access Token to avoid rate limits.

1. Go to your GitHub account settings -> Developer Settings -> Personal Access Tokens -> Tokens (classic).
2. Generate a new token (no specific scopes/permissions are required, it just needs to exist to authenticate your requests).
3. Create a `.env.local` file in the root of the DevPulse directory.
4. Add your token to the file:
```env
VITE_GITHUB_TOKEN=your_generated_token_here
```

### 4. Start the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 

## 📝 License
This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.
