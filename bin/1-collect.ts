import _ from "lodash";
import { createLogger, createBitbucket } from "@app/utils";
import fs from "fs";

const TMP_REPOS = __dirname + '/../tmp/repos.json';

const logger = createLogger();
const bitbucket = createBitbucket();

async function main(): Promise<void> {
  if (!process.env.BITBUCKET_WORKSPACE) throw "Missing BITBUCKET_WORKSPACE";

  // @logging
  logger('Collecting repositories');

  // Collect repositories
  const repos = [];
  let page = 1;

  while (true) {
    // @logging
    logger(`Collecting page: ${page}`);

    const { data } = await bitbucket.repositories.list({ workspace: process.env.BITBUCKET_WORKSPACE, pagelen: 50, page: String(page) });

    if (data.values) {
      repos.push(...data.values.map(r => ({
        name: r.slug,
        fullname: r.full_name,
        clone: r.links?.clone?.filter(c => c.name === 'ssh')[0].href
      })));
    } else {
      break;
    }

    if (data.next) {
      page++;
    } else {
      break;
    }
  }

  // @logging
  logger(`Collected repositories: ${repos.length}`);

  await fs.promises.writeFile(TMP_REPOS, JSON.stringify(repos, null, 2));

  // @logging
  logger(`Stored to ${TMP_REPOS}`);
}

// @wanted
(async () => main())();
