// GitHub Leaderboard API
// Reads from raw GitHub (no auth), writes via GitHub API (needs token)

const REPO_OWNER = "Codexx-ui";
const REPO_NAME = "Thesfapa";
const FILE_PATH = "public/leaderboard.json";
const BRANCH = "main";
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || "";

const RAW_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${FILE_PATH}`;
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

/**
 * Reads the leaderboard from GitHub (no auth needed)
 */
export async function readLeaderboard() {
  try {
    const res = await fetch(`${RAW_URL}?t=${Date.now()}`); // cache bust
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Failed to read leaderboard:", e);
    return [];
  }
}

/**
 * Saves a new score to the GitHub leaderboard
 */
export async function saveToLeaderboard({ player_name, score, max_combo }) {
  if (!GITHUB_TOKEN) {
    console.error("No GitHub token set. Add VITE_GITHUB_TOKEN to .env");
    return false;
  }

  try {
    // Step 1: Read current file + SHA
    const apiRes = await fetch(API_URL, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });

    if (!apiRes.ok) throw new Error(`GitHub API read failed: ${apiRes.status}`);
    const apiData = await apiRes.json();
    const sha = apiData.sha;

    // Step 2: Decode, add new score, sort, keep top 100
    let scores = [];
    try {
      // Decode properly handling UTF-8 characters
      const binaryString = atob(apiData.content.replace(/\n/g, ""));
      try {
        scores = JSON.parse(decodeURIComponent(escape(binaryString)));
      } catch {
        // Fallback if it wasn't encoded with unescape(encodeURIComponent)
        scores = JSON.parse(binaryString);
      }
    } catch (err) {
      console.error("Failed to parse existing leaderboard:", err);
      scores = [];
    }

    scores.push({
      player_name: String(player_name),
      score: Number(score),
      max_combo: Number(max_combo),
      timestamp: new Date().toISOString(),
    });

    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 100);

    // Step 3: Write back
    const writeRes = await fetch(API_URL, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `score: ${player_name} → ${score}`,
        content: btoa(unescape(encodeURIComponent(JSON.stringify(scores, null, 2)))),
        sha,
        branch: BRANCH,
      }),
    });

    if (!writeRes.ok) {
      const errData = await writeRes.json();
      throw new Error(errData.message || `Write failed: ${writeRes.status}`);
    }

    return true;
  } catch (e) {
    console.error("Leaderboard save error:", e);
    return false;
  }
}
