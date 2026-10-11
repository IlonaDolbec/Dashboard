import {
    GITHUB_API_URL,
    GITHUB_MAX_STATS_PAGES,
    GITHUB_PAGE_SIZE,
    GITHUB_REQUEST_TIMEOUT_MS,
    MAX_COMMIT_COUNT,
    MAX_PERIOD_DAYS,
} from "./constants";

export class GithubError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}

export interface RecentCommits {
    repository: string;
    commits: {
        sha: string;
        message: string;
        author: string;
        date: string;
        url: string;
    }[];
}

export interface RepoActivityStats {
    repository: string;
    periodDays: number;
    commitCount: number;
    contributorCount: number;
    truncated: boolean;
}

interface CommitItem {
    sha: string;
    html_url: string;
    commit: { message: string; author: { name?: string; email?: string; date: string } | null };
    author: { login: string } | null;
}

function assertRepository(repository: string) {
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
        throw new GithubError('"repository" must look like "owner/repo"', 400);
    }
}

async function fetchGithub(token: string, path: string, query: Record<string, string> = {}) {
    const url = new URL(`${GITHUB_API_URL}${path}`);
    url.search = new URLSearchParams(query).toString();

    let res: Response;
    try {
        res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "dashboard",
            },
            signal: AbortSignal.timeout(GITHUB_REQUEST_TIMEOUT_MS),
            cache: "no-store",
        });
    } catch {
        throw new GithubError("GitHub is unavailable", 502);
    }

    if (res.ok) return res.json();

    if (res.status === 401) {
        throw new GithubError("GitHub authorization expired: link your account again", 409);
    }
    if (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0") {
        throw new GithubError("GitHub rate limit reached, try again later", 429);
    }
    if (res.status === 403) {
        throw new GithubError("GitHub denied access to this repository or feature", 403);
    }
    if (res.status === 404) {
        throw new GithubError("Repository not found or not accessible with your GitHub account", 404);
    }
    if (res.status === 409) {
        return [];
    }
    throw new GithubError("GitHub is unavailable", 502);
}

export async function getRecentCommits(token: string, repository: string, commitCount: number): Promise<RecentCommits> {
    assertRepository(repository);
    if (!Number.isInteger(commitCount) || commitCount < 1 || commitCount > MAX_COMMIT_COUNT) {
        throw new GithubError(`"commit_count" must be an integer between 1 and ${MAX_COMMIT_COUNT}`, 400);
    }
    const items: CommitItem[] = await fetchGithub(token, `/repos/${repository}/commits`, {
        per_page: String(commitCount),
    });

    return {
        repository,
        commits: items.map((item) => ({
            sha: item.sha,
            message: item.commit.message.split("\n")[0],
            author: item.author?.login ?? item.commit.author?.name ?? "Unknown",
            date: item.commit.author?.date ?? "",
            url: item.html_url,
        })),
    };
}

export async function getRepoActivityStats(token: string, repository: string, periodDays: number): Promise<RepoActivityStats> {
    assertRepository(repository);
    if (!Number.isInteger(periodDays) || periodDays < 1 || periodDays > MAX_PERIOD_DAYS) {
        throw new GithubError(`"period_days" must be an integer between 1 and ${MAX_PERIOD_DAYS}`, 400);
    }

    const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();
    const contributors = new Set<string>();
    let commitCount = 0;
    let truncated = false;

    for (let page = 1; page <= GITHUB_MAX_STATS_PAGES; page++) {
        const items: CommitItem[] = await fetchGithub(token, `/repos/${repository}/commits`, {
            since,
            per_page: String(GITHUB_PAGE_SIZE),
            page: String(page),
        });

        commitCount += items.length;
        for (const item of items) {
            contributors.add(item.author?.login ?? item.commit.author?.email ?? item.sha);
        }

        if (items.length < GITHUB_PAGE_SIZE) break;
        if (page === GITHUB_MAX_STATS_PAGES) truncated = true;
    }

    return { repository, periodDays, commitCount, contributorCount: contributors.size, truncated };
}
