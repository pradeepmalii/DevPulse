// Generate dynamic dates based on today so the data always looks fresh
const today = new Date();

export const mockProfile = {
  login: "dev-ninja",
  name: "Ninja Developer",
  avatar_url: "https://github.com/identicons/dev-ninja.png",
  public_repos: 42,
  followers: 128,
  following: 35,
};

export const mockRepos = [
  { id: 1, name: "react-ui-components", description: "Reusable UI components", html_url: "https://github.com", stargazers_count: 145, language: "JavaScript", pushed_at: new Date().toISOString() },
  { id: 2, name: "express-auth-api", description: "Node.js REST API with JWT", html_url: "https://github.com", stargazers_count: 89, language: "TypeScript", pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
  { id: 3, name: "portfolio-v2", description: "My personal website", html_url: "https://github.com", stargazers_count: 12, language: "HTML", pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() },
  { id: 4, name: "data-scraper", description: "Web scraping tool built with BS4", html_url: "https://github.com", stargazers_count: 56, language: "Python", pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString() },
  { id: 5, name: "css-art-gallery", description: "Daily CSS art challenges", html_url: "https://github.com", stargazers_count: 3, language: "CSS", pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200).toISOString() },
  { id: 6, name: "cli-weather-app", description: "Command line tool to check weather", html_url: "https://github.com", stargazers_count: 230, language: "Go", pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 300).toISOString() }
];

// Generate 364 days of fake commit history (52 weeks * 7 days)
export const mockCommits = Array.from({ length: 364 }).map((_, i) => {
  const date = new Date();
  // subtract from today to go backwards
  date.setDate(date.getDate() - (364 - i)); 
  
  // Create some "clumpy" random data - zero on most weekends, active on weekdays
  const dayOfWeek = date.getDay();
  let count = 0;
  
  if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Weekdays
    // 70% chance of coding on a weekday, max 8 commits
    count = Math.random() > 0.3 ? Math.floor(Math.random() * 8) + 1 : 0;
  } else { // Weekends
    // 20% chance of coding on weekend, max 3 commits
    count = Math.random() > 0.8 ? Math.floor(Math.random() * 3) + 1 : 0;
  }

  return {
    date: date.toISOString().split('T')[0],
    count: count
  };
});

export const mockCollaborators = {
  // Nodes represent people
  nodes: [
    { id: "dev-ninja", group: 1, commits: 150, language: "JavaScript" }, // Center node (the user)
    { id: "alice-code", group: 2, commits: 80, language: "TypeScript" },
    { id: "bob-builder", group: 2, commits: 45, language: "Python" },
    { id: "charlie-dev", group: 2, commits: 120, language: "JavaScript" },
    { id: "dave-ops", group: 2, commits: 20, language: "Go" }
  ],
  // Links represent shared repositories
  links: [
    { source: "dev-ninja", target: "alice-code", value: 5 },
    { source: "dev-ninja", target: "bob-builder", value: 2 },
    { source: "dev-ninja", target: "charlie-dev", value: 8 },
    { source: "dev-ninja", target: "dave-ops", value: 1 },
    { source: "alice-code", target: "charlie-dev", value: 3 } // Inter-collaborator link
  ]
};
