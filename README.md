# Bitbucket2Github

Easy to use nodejs-based scripts for migrate Bitbucket repositories to Github repositories.

## Setup

Height.go is written in TypeScript and uses ESM loader.

1. `git clone git@github.com:f00b4r/bitbucket2github.git`
2. `npm install`
3. `cp .env.dist .evn`
4. `./b2g bin/[name]`

## Usage

```
./b2g bin/1-collect.ts
./b2g bin/2-create.ts
./b2g bin/3-push.ts
```
