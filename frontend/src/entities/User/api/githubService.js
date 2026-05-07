// src/services/githubService.js

const BASE_URL = import.meta.env.VITE_API_URL;



export const fetchProfile = async (username) => {
  const res = await fetch(`${BASE_URL}/api/github/user/${username}`);
  if (!res.ok) throw new Error('Profile not found');
  return res.json();
};

export const fetchRepos = async (username) => {
  // Fetch up to 100 recent repos
  const res = await fetch(`${BASE_URL}/api/github/repos/${username}`);
  if (!res.ok) throw new Error('Repos not found');
  return res.json();
};

// To get the 52-week contribution graph, the GitHub REST API doesn't provide it directly.
// We must use the GitHub GraphQL API!
// export const fetchCommits = async (username) => {
//   const query = `
//     query($userName:String!) {
//       user(login: $userName){
//         contributionsCollection {
//           contributionCalendar {
//             weeks {
//               contributionDays {
//                 contributionCount
//                 date
//               }
//             }
//           }
//         }
//       }
//     }
//   `;

//   const res = await fetch('https://api.github.com/graphql', {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       query,
//       variables: { userName: username }
//     })
//   });

//   if (!res.ok) throw new Error('Failed to fetch contributions');
  
//   const json = await res.json();
//   if (json.errors) throw new Error(json.errors[0].message);

//   // Flatten the nested GraphQL weeks array into a single flat array to perfectly match our mockData!
//   const weeks = json.data.user.contributionsCollection.contributionCalendar.weeks;
//   const days = [];
  
//   weeks.forEach(week => {
//     week.contributionDays.forEach(day => {
//       days.push({
//         date: day.date,
//         count: day.contributionCount
//       });
//     });
//   });

//   return days;
// };

export const fetchCommits = async (_username) => {
  return [];
};

export const fetchHourlyActivity = async (_username) => {
  return Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
};

export const fetchCollaborators = async (_username, _repos) => {
  return { nodes: [], links: [] };
};

// Fetch recent events to figure out what time of day the user is most active!
// export const fetchHourlyActivity = async (username) => {
//   try {
//     const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
//
//    // GitHub limits the events API to 300 events total.
//    // We will fetch all 3 pages (100 per page) to get the largest sample size possible!
//    for (let page = 1; page <= 3; page++) {
//      const res = await fetch(`${BASE_URL}/users/${username}/events?per_page=100&page=${page}`, { headers: getHeaders() });
//      if (!res.ok) break;
//
//      const events = await res.json();
//      if (events.length === 0) break; // Stop if there are no more events
//
//      events.forEach(event => {
//        if (event.type === 'PushEvent') {
//          const commitCount = event.payload.commits ? event.payload.commits.length : 1;
//          const date = new Date(event.created_at);
//          const hour = date.getHours();
//          hours[hour].count += commitCount;
//        }
//      });
//    }
//
//    return hours;
//  } catch (e) {
//    console.error("Failed to fetch hourly activity", e);
//    return null;
//  }
// };

// Fetch Collaborators: GitHub doesn't have a single "collaborators" endpoint for a user.
// Instead, we will look at their top 3 repositories and extract all the contributors!
// export const fetchCollaborators = async (username, repos) => {
//   // Filter for repos the user actually owns (not forks) and sort by popularity
//   const topRepos = repos
//     .filter(r => !r.fork)
//     .sort((a, b) => b.stargazers_count - a.stargazers_count)
//     .slice(0, 3); // Just check top 3 to avoid hitting API rate limits immediately

//   const nodesMap = new Map();
//   const links = [];

//   // Add the primary user as the center node
//   nodesMap.set(username, { id: username, group: 1 });

//   // For each top repo, fetch the list of contributors
//   for (const repo of topRepos) {
//     try {
//       const res = await fetch(repo.contributors_url, { headers: getHeaders() });
//       if (!res.ok) continue;
//       const contributors = await res.json();

//       contributors.forEach(contributor => {
//         // Add contributor to nodes list
//         if (!nodesMap.has(contributor.login)) {
//           nodesMap.set(contributor.login, { id: contributor.login, group: 2 });
//         }
        
//         // Connect them to the main user
//         if (contributor.login !== username) {
//           const existingLink = links.find(l => 
//             (l.source === username && l.target === contributor.login) || 
//             (l.target === username && l.source === contributor.login)
//           );
          
//           if (existingLink) {
//             existingLink.value += 1; // Stronger connection if they work on multiple repos!
//           } else {
//             links.push({ source: username, target: contributor.login, value: 1 });
//           }
//         }
//       });
//     } catch (e) {
//       console.warn("Failed to fetch contributors for", repo.name);
//     }
//   }

//   return {
//     nodes: Array.from(nodesMap.values()),
//     links: links
//   };
// };
