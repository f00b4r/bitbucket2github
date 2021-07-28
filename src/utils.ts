import debug from "debug";
import { Octokit } from "@octokit/rest";
import { Bitbucket } from "bitbucket";

export function createLogger(namespace: string = 'b2g'): debug.Debugger {
  debug.enable('*');
  return debug(namespace);
}

export function createGithub() {
  if (!process.env.GITHUB_TOKEN) throw 'Missing GITHUB_TOKEN';

  return new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });
}

export function createBitbucket() {
  if (!process.env.BITBUCKET_USER) throw 'Missing BITBUCKET_USER';
  if (!process.env.BITBUCKET_PASS) throw 'Missing BITBUCKET_PASS';

  return new Bitbucket({
    auth: {
      username: process.env.BITBUCKET_USER,
      password: process.env.BITBUCKET_PASS,
    },
  });
}
