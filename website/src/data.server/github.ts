import fetch from 'node-fetch';
import url from 'url';
import path from 'path';

export async function getGithubData(repoRootDir: string, filePath: string) {
  const since = new Date('2018-06-01').toISOString();

  const results = {
    contributors: [] as string[],
    lastUpdated: since,
    repoFileUrl: null as string,
    repoFilePath: null as string,
  };

  try {
    results.repoFilePath = path.relative(repoRootDir, filePath);

    const githubUrl = new URL(
      results.repoFilePath,
      `https://github.com/ionic-team/capacitor-site/blob/main/`,
    );
    results.repoFileUrl = githubUrl.href;

    const commits = await fetchGithubCommits(results.repoFilePath, since);

    results.contributors = Array.from(
      new Set(commits.map(commit => commit.author.login)),
    );
    results.lastUpdated = commits.length
      ? commits[0].commit.author.date
      : since;
  } catch (e) {
    console.error(e);
  }

  return results;
}

async function fetchGithubCommits(
  repoFilePath: string,
  since: string,
): Promise<any[]> {
  const fetchUrl = url.format({
    protocol: 'https',
    hostname: 'api.github.com',
    pathname: 'repos/ionic-team/capacitor-site/commits',
    query: {
      access_token: process.env.GITHUB_TOKEN,
      since: since,
      path: repoFilePath,
    },
  });

  const request = await fetch(fetchUrl);

  if (request.status === 403) {
    console.warn(
      `Ignoring commit history for ${repoFilePath} due to GH API limit. To resolve, add the GITHUB_TOKEN envar.`,
    );
    return [];
  }

  return request.json();
}
