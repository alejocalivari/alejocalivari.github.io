(() => {
    const REPOS_URL = "https://api.github.com/users/alejocalivari/repos";
    const GITHUB_PROFILE_URL = "https://github.com/alejocalivari";
    const REPO_LIMIT = 5;

    function formatDate(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "";
        }
        return date.toISOString().slice(0, 10);
    }

    function createMetaItem(label, value) {
        const item = document.createElement("span");
        item.className = "repo-meta-item";
        item.textContent = `${label}: ${value}`;
        return item;
    }

    function renderError(repoList) {
        const wrapper = document.createElement("div");
        wrapper.className = "repo-error-wrap";

        const message = document.createElement("p");
        message.className = "repo-error";
        message.textContent = "No se pudieron cargar los repos ahora. Miralos en GitHub.";

        const profileLink = document.createElement("a");
        profileLink.className = "repo-link";
        profileLink.href = GITHUB_PROFILE_URL;
        profileLink.target = "_blank";
        profileLink.rel = "noopener noreferrer";
        profileLink.textContent = "https://github.com/alejocalivari";

        wrapper.appendChild(message);
        wrapper.appendChild(profileLink);
        repoList.replaceChildren(wrapper);
    }

    function renderRepos(repoList, repos) {
        const fragment = document.createDocumentFragment();

        repos.forEach((repo) => {
            const card = document.createElement("article");
            card.className = "repo-card";

            const name = document.createElement("h3");
            name.className = "repo-name";
            name.textContent = repo.name || "Repositorio sin nombre";
            card.appendChild(name);

            if (repo.description) {
                const description = document.createElement("p");
                description.className = "repo-description";
                description.textContent = repo.description;
                card.appendChild(description);
            }

            const meta = document.createElement("div");
            meta.className = "repo-meta";

            if (repo.language) {
                meta.appendChild(createMetaItem("Lenguaje", repo.language));
            }

            const updated = formatDate(repo.updated_at);
            if (updated) {
                meta.appendChild(createMetaItem("Actualizado", updated));
            }

            if (meta.childNodes.length > 0) {
                card.appendChild(meta);
            }

            const link = document.createElement("a");
            link.className = "repo-link";
            link.href = repo.html_url || GITHUB_PROFILE_URL;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Ver repositorio";
            card.appendChild(link);

            fragment.appendChild(card);
        });

        repoList.replaceChildren(fragment);
    }

    async function loadLatestRepos() {
        const repoList = document.getElementById("repo-list");
        if (!repoList) {
            return;
        }

        try {
            const response = await fetch(REPOS_URL, {
                headers: { Accept: "application/vnd.github+json" }
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error("Invalid GitHub API response");
            }

            const latestRepos = data
                .filter((repo) => repo && repo.private === false && repo.fork === false && repo.name !== "alejocalivari.github.io")
                .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                .slice(0, REPO_LIMIT);

            renderRepos(repoList, latestRepos);
        } catch (error) {
            renderError(repoList);
        }
    }

    document.addEventListener("DOMContentLoaded", loadLatestRepos);
})();