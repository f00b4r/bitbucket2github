import { createLogger } from "@app/utils";
import async from "async";
import fs from "fs";
import path from "path";
import util from "util";
import { exec as _exec } from "child_process";

const TMP_REPOS = __dirname + '/../tmp/repos.json';
const TMP_DIR = __dirname + '/../tmp';

const logger = createLogger();
const exec = util.promisify(_exec);

async function main(): Promise<void> {
  if (!process.env.GITHUB_ORG) throw "Missing GITHUB_ORG";

  // @logging
  logger('Pushing repositories');

  // Queue
  const q = async.queue(async (repo: Repo, callback) => {
    try {
      logger(`Git: cloning ${repo.name}`);
      const output1 = await exec(`git clone --bare ${repo.clone} ${repo.name}`, { cwd: TMP_DIR });
      logger(`Git: ${output1.stdout} ${output1.stderr}`);
    } catch (e) {
      logger(e.message);
    }

    try {
      logger(`Git: pushing ${repo.name}`);
      const output2 = await exec(`git push --mirror git@github.com:${process.env.GITHUB_ORG}/${repo.name}`, { cwd: path.resolve(TMP_DIR, repo.name) });
      logger(`Git: ${output2.stdout} ${output2.stderr}`);
    } catch (e) {
      logger(e.message);
      return;
    }

    if (process.env.B2G_CLEAN === '1') {
      try {
        logger(`Git: removing ${repo.name}`);
        const output3 = await exec(`rm -rf ${repo.name}`, { cwd: TMP_DIR });
        logger(`Git: ${output3.stdout} ${output3.stderr}`);
      } catch (e) {
        logger(e.message);
        return;
      }
    }

    logger(`Remaining: ${q.length()}`);

    callback();
  }, 3);

  // Collect repositories
  const buffer = await fs.promises.readFile(TMP_REPOS);
  const repos = JSON.parse(buffer.toString());

  for (const repo of repos) {
    q.push(repo);
  }

  // Process queue
  await q.drain();

  // @logging
  logger('All repositories pushed to Github');
}

// @wanted
(async () => main())();
