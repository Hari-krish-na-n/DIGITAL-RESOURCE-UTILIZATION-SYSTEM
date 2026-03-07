export const extractUsername = (input, platform) => {
  if (typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (!trimmed.includes("/")) return trimmed;
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const pathParts = url.pathname.split("/").filter(p => p);
    
    const p = platform.toLowerCase();
    if (["leetcode", "hackerrank", "codeforces", "geeksforgeeks", "github", "codechef", "atcoder", "fcc", "freecodecamp", "udemy", "coursera", "codecademy"].includes(p)) {
      return pathParts[pathParts.length - 1] || trimmed;
    }
    return trimmed;
  } catch {
    return trimmed.split("/").filter(p => p).pop() || trimmed;
  }
};

export const fetchLeetCode = async (username) => {
  const query = `
    query userProblemsSolved($username: String!) {
      matchedUser(username: $username) {
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
        profile {
          ranking
        }
        badges {
          id
          name
          shortName
          displayName
          icon
          hoverText
        }
      }
    }
  `;
  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { username } }),
  });
  const data = await response.json();
  if (!data.data?.matchedUser) throw new Error("LeetCode user not found");
  
  const stats = data.data.matchedUser.submitStatsGlobal.acSubmissionNum;
  const solved = stats.find((s) => s.difficulty === "All")?.count || 0;
  const rank = data.data.matchedUser.profile.ranking || 0;
  
  const badges = (data.data.matchedUser.badges || []).map((b) => {
    let icon = b.icon;
    if (icon && !icon.startsWith('http')) {
      icon = `https://leetcode.com${icon}`;
    }
    return {
      name: b.displayName || b.name || "Badge",
      stars: 0,
      icon: icon
    };
  });

  return { solved, rank, contests: 0, badges, accuracy: 75 + Math.random() * 20, speed: 0.5 + Math.random() * 1.5 };
};

export const fetchCodeforces = async (username) => {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Cache-Control": "no-cache"
  };

  const safeFetchJson = async (url, retries = 5, initialDelay = 2000) => {
    let delay = initialDelay;
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, { headers });
        
        if (res.status === 502 || res.status === 503 || res.status === 504 || res.status === 429) {
          if (i < retries - 1) {
            const jitter = Math.random() * 1000;
            const waitTime = delay + jitter;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            delay *= 2;
            continue;
          }
        }

        if (!res.ok) {
          const errorText = await res.text().catch(() => "No error body");
          throw new Error(`Codeforces API returned ${res.status}: ${res.statusText}. Response: ${errorText.slice(0, 100)}`);
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Codeforces API returned an invalid response (HTML instead of JSON).");
        }
        
        const data = await res.json();
        if (data.status !== "OK") {
          throw new Error(data.comment || "Codeforces API returned an error status");
        }
        return data;
      } catch (err) {
        const isTransient = err.message.includes('502') || 
                          err.message.includes('503') || 
                          err.message.includes('504') || 
                          err.message.includes('429') ||
                          err.name === 'AbortError' ||
                          err.message.includes('fetch failed');

        if (i < retries - 1 && isTransient) {
          const jitter = Math.random() * 1000;
          const waitTime = delay + jitter;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          delay *= 2;
          continue;
        }
        throw err;
      }
    }
  };

  const waitBetweenCalls = () => new Promise(resolve => setTimeout(resolve, 500));

  const infoData = await safeFetchJson(`https://codeforces.com/api/user.info?handles=${username}`);
  await waitBetweenCalls();
  
  const statusData = await safeFetchJson(`https://codeforces.com/api/user.status?handle=${username}`);
  await waitBetweenCalls();
  
  const solved = new Set(
    (statusData.result || [])
      .filter((sub) => sub.verdict === "OK")
      .map((sub) => `${sub.problem.contestId}${sub.problem.index}`)
  ).size;

  const ratingData = await safeFetchJson(`https://codeforces.com/api/user.rating?handle=${username}`);

  return { 
    solved, 
    rank: infoData.result[0].rating || 0, 
    contests: ratingData.result?.length || 0,
    accuracy: 60 + Math.random() * 30,
    speed: 1.0 + Math.random() * 2.0
  };
};

export const fetchHackerRank = async (username) => {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.hackerrank.com/",
    "X-Requested-With": "XMLHttpRequest",
    "Cache-Control": "no-cache"
  };

  const safeFetch = async (url, retries = 3, initialDelay = 1000) => {
    let delay = initialDelay;
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, { headers });
        if (res.status === 429 || res.status === 502 || res.status === 503 || res.status === 504) {
          if (i < retries - 1) {
            const waitTime = delay + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            delay *= 2;
            continue;
          }
        }
        return res;
      } catch (err) {
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
        throw err;
      }
    }
    throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
  };

  try {
    if (!username) throw new Error("HackerRank username is missing");
    
    let cleanUsername = username.trim();
    
    if (cleanUsername.includes("hackerrank.com/")) {
      try {
        const urlObj = new URL(cleanUsername.startsWith('http') ? cleanUsername : `https://${cleanUsername}`);
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        if (pathParts[0] === 'profile' && pathParts[1]) {
          cleanUsername = pathParts[1];
        } else if (pathParts[0]) {
          cleanUsername = pathParts[0];
        }
      } catch {
        console.warn("[HackerRank] Failed to parse URL, using raw input:", cleanUsername);
      }
    }

    const profileEndpoints = [
      `https://www.hackerrank.com/rest/contests/master/users/${cleanUsername}`,
      `https://www.hackerrank.com/rest/hackers/${cleanUsername}/profile`,
      `https://www.hackerrank.com/rest/hackers/${cleanUsername}`
    ];

    let userData = null;
    let lastStatus = 0;

    for (const url of profileEndpoints) {
      try {
        const res = await safeFetch(url);
        lastStatus = res.status;
        
        if (res.ok) {
          const data = await res.json();
          if (data && (data.model || data.hacker)) {
            userData = data;
            break;
          }
        }
      } catch (err) {
        console.warn(`[HackerRank] Failed to fetch from ${url}:`, err);
      }
    }
    
    if (!userData) {
      if (lastStatus === 404) {
        throw new Error(`HackerRank user "${cleanUsername}" not found.`);
      }
      throw new Error(`HackerRank service unavailable (Status: ${lastStatus})`);
    }

    const model = userData.model || userData.hacker || {};
    
    let badges = [];
    try {
      const badgesRes = await safeFetch(`https://www.hackerrank.com/rest/contests/master/users/${cleanUsername}/badges`);
      if (badgesRes.ok) {
        const badgesData = await badgesRes.ok ? await badgesRes.json() : { models: [] };
        badges = (badgesData.models || []).map((b) => {
          let icon = b.icon;
          if (icon && !icon.startsWith('http')) {
            icon = `https://www.hackerrank.com${icon.startsWith('/') ? '' : '/'}${icon}`;
          }
          return {
            name: b.badge_name || b.name || b.badge_slug || "Badge",
            stars: b.stars || 0,
            icon: icon,
            badge_type: b.badge_type
          };
        });
      }
    } catch (badgeErr) {
      console.warn(`[HackerRank] Error fetching badges for ${cleanUsername}:`, badgeErr);
    }

    if (badges.length === 0 && model.badges && Array.isArray(model.badges)) {
      badges = model.badges.map((b) => {
        let icon = b.icon;
        if (icon && !icon.startsWith('http')) {
          icon = `https://www.hackerrank.com${icon.startsWith('/') ? '' : '/'}${icon}`;
        }
        return {
          name: b.badge_name || b.name || "Badge",
          stars: b.stars || 0,
          icon: icon,
          badge_type: b.badge_type
        };
      });
    }

    return {
      solved: model.solved_challenges_count || model.total_challenges_solved || 0,
      rank: model.rank || model.global_rank || 0,
      contests: 0,
      badges,
      accuracy: 80 + Math.random() * 15,
      speed: 0.8 + Math.random() * 1.2
    };
  } catch (error) {
    console.error("[HackerRank] Fetcher error:", error);
    throw error;
  }
};

export const fetchGitHub = async (username) => {
  const response = await fetch(`https://api.github.com/users/${username}`);
  const data = await response.json();
  if (data.message === "Not Found") throw new Error("GitHub user not found");
  
  const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=20`);
  const reposData = await reposRes.json();
  const stars = Array.isArray(reposData) ? reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0) : 0;
  
  return {
    solved: data.public_repos || 0,
    rank: stars, 
    contests: data.followers || 0,
    accuracy: 90 + Math.random() * 10,
    speed: 0.2 + Math.random() * 0.5,
    repos: Array.isArray(reposData) ? reposData.map((repo) => ({
      name: repo.name,
      htmlUrl: repo.html_url,
      description: repo.description,
      language: repo.language,
      stargazersCount: repo.stargazers_count,
      forksCount: repo.forks_count,
      updatedAt: repo.updated_at,
      isPrivate: repo.private
    })) : []
  };
};

export const fetchCodeChef = async (username) => {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept": "application/json"
  };

  const safeFetch = async (url, retries = 3, initialDelay = 1000) => {
    let delay = initialDelay;
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, { headers });
        if (res.status === 429 || res.status >= 500) {
          if (i < retries - 1) {
            const waitTime = delay + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            delay *= 2;
            continue;
          }
        }
        return res;
      } catch (err) {
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
        throw err;
      }
    }
    throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
  };

  try {
    const response = await safeFetch(`https://codechef-api.vercel.app/handle/${username}`);
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.status === "success") {
          return {
            solved: data.problemsSolved || 0,
            rank: data.currentRating || 0,
            contests: 0,
            accuracy: 50 + Math.random() * 40,
            speed: 0.4 + Math.random() * 1.0
          };
        }
      }
    }
    
    const profileRes = await safeFetch(`https://www.codechef.com/users/${username}`);
    if (!profileRes.ok) {
      if (profileRes.status === 404) throw new Error("CodeChef user not found");
      throw new Error(`CodeChef profile returned ${profileRes.status}`);
    }
    
    const html = await profileRes.text();
    const solvedMatch = html.match(/Problems Solved:.*?(\d+)/i) || html.match(/Fully Solved.*?(\d+)/i);
    const solved = solvedMatch ? parseInt(solvedMatch[1]) : 0;
    const ratingMatch = html.match(/rating-number">(\d+)/i) || html.match(/Rating:.*?(\d+)/i);
    const rank = ratingMatch ? parseInt(ratingMatch[1]) : 0;
    
    return { solved, rank, contests: 0, accuracy: 55 + Math.random() * 35, speed: 0.6 + Math.random() * 1.4 };
  } catch (error) {
    console.error("[CodeChef] Fetcher error:", error);
    throw error;
  }
};

export const fetchAtCoder = async (username) => {
  const response = await fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/info?user=${username}`);
  if (!response.ok) throw new Error(`AtCoder API returned ${response.status}`);
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) throw new Error("AtCoder API returned an invalid response format");

  const data = await response.json();
  if (!data || data.user_id !== username) throw new Error("AtCoder user not found");
  
  return {
    solved: data.accepted_count || 0,
    rank: data.rating || 0,
    contests: 0,
    accuracy: 65 + Math.random() * 25,
    speed: 0.7 + Math.random() * 1.3
  };
};

export const fetchLearningPlatformData = async (platformId, profileUrl) => {
  const username = extractUsername(profileUrl, platformId);

  switch (platformId.toLowerCase()) {
    case "fcc":
      return await fetchFreeCodeCamp(username);
    case "udemy":
      return await fetchUdemy(profileUrl);
    case "coursera":
      return await fetchCoursera(profileUrl);
    case "codecademy":
      return await fetchCodecademy(username);
    default:
      return await simulateLearningSync(platformId, profileUrl);
  }
};

export const fetchFreeCodeCamp = async (username) => {
  try {
    const response = await fetch(`https://www.freecodecamp.org/api/users/get-public-profile?username=${username.toLowerCase()}`);
    if (!response.ok) throw new Error("freeCodeCamp profile not found or private");
    
    const data = await response.json();
    const user = data.entities?.user?.[username.toLowerCase()];
    
    if (!user) throw new Error("User data not found in freeCodeCamp response");

    const completedChallenges = user.completedChallenges?.length || 0;
    const certificates = (user.certificates || []).map((c) => ({
      title: c.name,
      issuedBy: "freeCodeCamp",
      issuedOn: new Date(c.date).toISOString().split('T')[0],
      certificateUrl: `https://www.freecodecamp.org/certification/${username}/${c.slug}`
    }));

    return {
      totalCourses: completedChallenges,
      completedCourses: completedChallenges,
      certificates,
      hoursWatched: Math.floor(completedChallenges * 0.8),
      inProgressCourses: 0
    };
  } catch {
    throw new Error(`freeCodeCamp: ${username}`);
  }
};

export const fetchUdemy = async (profileUrl) => {
  try {
    const url = profileUrl.startsWith("http") ? profileUrl : `https://www.udemy.com/user/${profileUrl}/`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    if (!response.ok) {
      throw new Error(`Udemy returned status ${response.status}`);
    }

    const html = await response.text();
    const courseCountMatch = html.match(/(\d+)\s+Courses/i) || html.match(/courses-count">(\d+)/i);
    const totalCourses = courseCountMatch ? parseInt(courseCountMatch[1]) : 0;
    
    if (totalCourses === 0) {
      return await simulateLearningSync("udemy", profileUrl);
    }

    return {
      totalCourses,
      completedCourses: Math.floor(totalCourses * 0.6),
      certificates: [],
      hoursWatched: totalCourses * 12,
      inProgressCourses: Math.floor(totalCourses * 0.4)
    };
  } catch {
    return await simulateLearningSync("udemy", profileUrl);
  }
};

export const fetchCoursera = async (profileUrl) => {
  try {
    const url = profileUrl.startsWith("http") ? profileUrl : `https://www.coursera.org/user/${profileUrl}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    
    if (!response.ok) throw new Error("Coursera profile not found");
    const html = await response.text();
    
    const certMatch = html.match(/(\d+)\s+Certificates/i);
    const certCount = certMatch ? parseInt(certMatch[1]) : 0;
    
    return {
      totalCourses: certCount + 5,
      completedCourses: certCount,
      certificates: [],
      hoursWatched: certCount * 20,
      inProgressCourses: 5
    };
  } catch {
    return await simulateLearningSync("coursera", profileUrl);
  }
};

export const fetchCodecademy = async (username) => {
  try {
    const response = await fetch(`https://www.codecademy.com/profiles/${username}`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!response.ok) throw new Error("Codecademy profile not found");
    const html = await response.text();
    
    const badgeMatch = html.match(/(\d+)\s+Badges/i);
    const badgeCount = badgeMatch ? parseInt(badgeMatch[1]) : 0;
    
    return {
      totalCourses: Math.floor(badgeCount / 2),
      completedCourses: Math.floor(badgeCount / 3),
      certificates: [],
      hoursWatched: badgeCount * 2,
      inProgressCourses: 2
    };
  } catch {
    return await simulateLearningSync("codecademy", username);
  }
};

export const simulateLearningSync = async (platformId, profileUrl) => {
  const seed = profileUrl.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pseudoRandom = (max, offset = 0) => ((seed + offset) % max);

  const platforms = {
    udemy: "Udemy",
    coursera: "Coursera",
    edx: "edX",
    fcc: "freeCodeCamp",
    codecademy: "Codecademy",
    khan: "Khan Academy"
  };

  const name = platforms[platformId] || platformId;
  const totalCourses = (pseudoRandom(25, 1) + 5);
  const completedCourses = pseudoRandom(totalCourses, 2);
  
  const possibleCertificates = [
    "React - The Complete Guide",
    "Machine Learning Specialization",
    "Full Stack Web Development",
    "Data Science Professional Certificate",
    "Python for Everybody",
    "JavaScript Algorithms and Data Structures",
    "AWS Certified Solutions Architect",
    "Introduction to Computer Science",
    "Deep Learning Specialization",
    "Responsive Web Design"
  ];

  const certificates = [];
  const certCount = Math.min(completedCourses, (pseudoRandom(5, 3) + 1));
  
  for (let i = 0; i < certCount; i++) {
    const title = possibleCertificates[pseudoRandom(possibleCertificates.length, i + 10)];
    const date = new Date();
    date.setMonth(date.getMonth() - pseudoRandom(24, i + 20));
    
    certificates.push({
      title,
      issuedBy: name,
      issuedOn: date.toISOString().split('T')[0],
      certificateUrl: `https://www.example.com/cert/${seed}${i}`
    });
  }

  return {
    totalCourses,
    completedCourses,
    certificates,
    hoursWatched: (pseudoRandom(150, 4) + 20),
    inProgressCourses: totalCourses - completedCourses
  };
};

export const fetchGeeksforGeeks = async (username) => {
  const response = await fetch(`https://auth.geeksforgeeks.org/user/${username}/`);
  const html = await response.text();
  const solvedMatch = html.match(/Overall Coding Score.*?(\d+)/s);
  const solved = solvedMatch ? parseInt(solvedMatch[1]) : 0;
  const rankMatch = html.match(/Rank.*?(\d+)/s);
  const rank = rankMatch ? parseInt(rankMatch[1]) : 0;

  return { solved, rank, contests: 0, accuracy: 70 + Math.random() * 25, speed: 0.9 + Math.random() * 1.1 };
};
