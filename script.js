const usernameInput = document.getElementById("username");
const searchBtn = document.getElementById("search-btn");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");

const profileCard = document.querySelector(".profile-card");
const topRepositories = document.querySelector(".top-repositories");

const avatar = document.getElementById("avatar");
const nameEl = document.getElementById("name");
const bio = document.getElementById("bio");

const followersCount = document.getElementById("followers-count");
const followingCount = document.getElementById("following-count");

const repoCount = document.getElementById("repo-count");
const joinDate = document.getElementById("join-date");

const score = document.getElementById("score");
const age = document.getElementById("age");

const starsCount = document.getElementById("stars-count");
const forksCount = document.getElementById("forks-count");

const starsPerRepo = document.getElementById("stars-per-repo");
const mostUsedLanguage = document.getElementById("most-used-language");

const repoList = document.getElementById("repo-list");

searchBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();

    if (username === "") {
        alert("Please enter a GitHub username.");
        return;
    }

    getProfile(username);
});

usernameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});

async function getProfile(username) {

    loading.style.display = "block";
    errorMessage.style.display = "none";
    profileCard.style.display = "none";
    topRepositories.style.display = "none";

    try {

        const response = await fetch(
            `https://api.github.com/users/${username}`
        );

        if (!response.ok) {
            throw new Error("GitHub user not found");
        }

        const data = await response.json();

        displayProfile(data);

        await getRepositories(username, data);

    } catch (error) {

        console.error(error);

        errorMessage.style.display = "block";
        errorMessage.textContent = error.message;

    } finally {

        loading.style.display = "none";
    }
}

function displayProfile(data) {

    profileCard.style.display = "flex";

    avatar.src = data.avatar_url;

    nameEl.textContent = data.name || data.login;

    bio.textContent = data.bio || "No bio available.";

    followersCount.textContent = data.followers;

    followingCount.textContent = data.following;

    repoCount.textContent = data.public_repos;

    joinDate.textContent = new Date(
        data.created_at
    ).toLocaleDateString();

    avatar.onclick = () => window.open(data.html_url, "_blank");

    nameEl.onclick = () => window.open(data.html_url, "_blank");
}

async function getRepositories(username, profile) {

    try {

        const response = await fetch(
            `https://api.github.com/users/${username}/repos`
        );

        if (!response.ok) {
            throw new Error("Unable to fetch repositories.");
        }

        const repos = await response.json();

        displayRepositories(repos);

        calculateAnalytics(profile, repos);

    } catch (error) {

        console.error(error);

    }
}

function calculateAnalytics(profile, repos) {

    let totalStars = 0;
    let totalForks = 0;

    const languageCounts = {};

    for (const repo of repos) {

        totalStars += repo.stargazers_count;

        totalForks += repo.forks_count;

        const language = repo.language || "Unknown";

        languageCounts[language] =
            (languageCounts[language] || 0) + 1;
    }

    starsCount.textContent = totalStars;

    forksCount.textContent = totalForks;

    starsPerRepo.textContent =
        repos.length > 0
            ? (totalStars / repos.length).toFixed(1)
            : 0;

    if (repos.length > 0) {

        const mostUsedLanguageName = Object.keys(languageCounts).reduce(
            (a, b) =>
                languageCounts[a] >= languageCounts[b] ? a : b
        );

        mostUsedLanguage.textContent = mostUsedLanguageName;

    } else {

        mostUsedLanguage.textContent = "None";
    }

    const joined = new Date(profile.created_at);

    const today = new Date();

    const accountAge =
        today.getFullYear() - joined.getFullYear();

    age.textContent = accountAge;

    const rawScore =
        profile.followers +
        totalStars +
        totalForks +
        accountAge * 5;

    score.textContent = Math.min(rawScore, 100);
}

function displayRepositories(repos) {

    topRepositories.style.display = "block";

    repoList.innerHTML = "";

    repos
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5)
        .forEach(repo => {

            const repoCard = document.createElement("div");

            repoCard.classList.add("repo-card");

            repoCard.innerHTML = `
                <h3>${repo.name}</h3>

                <p>${repo.description || "No description available."}</p>

                <div class="repo-stats">
                    <span>Stars: ${repo.stargazers_count}</span>
                    <span>Forks: ${repo.forks_count}</span>
                    <span>${repo.language || "Unknown"}</span>
                </div>
            `;

            repoCard.addEventListener("click", () => {
                window.open(repo.html_url, "_blank");
            });

            repoList.appendChild(repoCard);
        });
}