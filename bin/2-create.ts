import { createLogger, createGithub } from "@app/utils";
import async from "async";
import fs from "fs";

const TMP_REPOS = __dirname + '/../tmp/repos.json';

const logger = createLogger();
const github = createGithub();

async function main(): Promise<void> {
  if (!process.env.GITHUB_ORG) throw "Missing GITHUB_ORG";

  // @logging
  logger('Creating repositories');

  // Queue
  const q = async.queue(async (repo: Repo, callback) => {
    try {
      const { data } = await github.repos.createInOrg({
        name: repo.name,
        org: <string>process.env.GITHUB_ORG,
        private: true,
        allow_merge_commit: false,
        has_projects: false,
        delete_branch_on_merge: true
      });

      logger(`New repository created ${data.full_name}`);

      await sleep(500);
    } catch (e) {
      logger(e.message);
    }

    callback();
  }, 1);

  // Collect repositories
  const buffer = await fs.promises.readFile(TMP_REPOS);
  const repos = JSON.parse(buffer.toString());

  for (const repo of repos) {
    q.push(repo);
  }

  // Process queue
  await q.drain();

  // @logging
  logger('All repositories created in Github');
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// @wanted
(async () => main())();
