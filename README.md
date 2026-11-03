# CodeceptJS helper for [Visual Regression Tracker](https://github.com/Visual-Regression-Tracker/Visual-Regression-Tracker)

[![npm](https://img.shields.io/npm/v/@visual-regression-tracker/agent-codeceptjs)](https://www.npmjs.com/package/@visual-regression-tracker/agent-codeceptjs)

Adds `I.vrtStart()`, `I.vrtTrack()` and `I.vrtStop()` to [CodeceptJS](https://codecept.io) tests. The helper is built on [sdk-js](https://github.com/Visual-Regression-Tracker/sdk-js).

## Requirements

- CodeceptJS 3.7+ or 4
- Node.js 26 or later
- One of the Playwright, Puppeteer, WebDriver or Appium helpers
- Visual Regression Tracker server 5.0.8 or later; 6 is recommended

## Install

```sh
npm install --save-dev @visual-regression-tracker/agent-codeceptjs
```

## Configuration

| Option | Environment variable | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `apiUrl` | `VRT_APIURL` | yes | | URL of the server API, e.g. `http://localhost:4200` |
| `apiKey` | `VRT_APIKEY` | yes | | API key of a user with access to the project |
| `project` | `VRT_PROJECT` | yes | | Project name or ID |
| `branchName` | `VRT_BRANCHNAME` | yes | | Current git branch |
| `sourceBranch` | `VRT_SOURCEBRANCH` | no | project's main branch | Branch to take baselines from while `branchName` has none of its own |
| `ciBuildId` | `VRT_CIBUILDID` | no | | ID of one CI build; machines with the same ID share a build |
| `enableSoftAssert` | `VRT_ENABLESOFTASSERT` | no | `false` | Log failed comparisons instead of failing the step |


Add the helper next to your browser helper in `codecept.conf.js` (or `.ts`):

```js
export const config = {
  helpers: {
    Playwright: {
      url: "http://localhost:3000",
      browser: "chromium",
    },
    VisualRegressionTrackerHelper: {
      require: "@visual-regression-tracker/agent-codeceptjs",

      // URL where the backend is running. Required
      apiUrl: "http://localhost:4200",

      // Project name or ID. Required
      project: "Default project",

      // User API key. Required
      apiKey: "tXZVHX0EA4YQM1MGDD",

      // Current git branch. Required
      branchName: "develop",

      // Branch to take baselines from when branchName has none yet. Optional
      sourceBranch: "release",

      // Log errors instead of throwing exceptions. Optional, default false
      enableSoftAssert: true,

      // Unique ID of one CI build. Optional
      ciBuildId: "SOME_UNIQUE_ID",
    },
  },
};
```

`sourceBranch` replaces `baselineBranchName`, which still works but is deprecated.

### `vrt.json` and environment variables

Settings missing from the helper config are read from `vrt.json` in the
working directory and from environment variables, which win over `vrt.json`.
With only `require` in the helper config, everything comes from there:

```js
VisualRegressionTrackerHelper: {
  require: "@visual-regression-tracker/agent-codeceptjs",
},
```

```json
{
  "apiUrl": "http://localhost:4200",
  "project": "Default project",
  "apiKey": "tXZVHX0EA4YQM1MGDD",
  "branchName": "develop",
  "sourceBranch": "release",
  "enableSoftAssert": false,
  "ciBuildId": "commit_sha"
}
```

```sh
VRT_APIURL="http://localhost:4200"
VRT_PROJECT="Default project"
VRT_APIKEY="tXZVHX0EA4YQM1MGDD"
VRT_BRANCHNAME="develop"
VRT_SOURCEBRANCH="release"
VRT_ENABLESOFTASSERT=true
VRT_CIBUILDID="commit_sha"
```

### TypeScript definitions

```sh
npx codeceptjs def
```

## Usage

```js
Feature("Visual test");

BeforeSuite(({ I }) => {
  I.vrtStart();
});

AfterSuite(({ I }) => {
  I.vrtStop();
});

Scenario("home page", ({ I }) => {
  I.amOnPage("/");

  I.vrtTrack("Home page");

  I.vrtTrack("Home page, full", {
    os: "linux",
    browser: "chromium",
    viewport: "1280x720",
    device: "desktop",
    customTags: "smoke,home",
    comment: "Logged out",
    diffTollerancePercent: 1,
    ignoreAreas: [{ x: 10, y: 10, width: 200, height: 200 }],
    fullScreen: true,
    retryCount: 0,
  });
});
```

`vrtTrack` options are all optional:

| Option | Description |
| --- | --- |
| `os`, `browser`, `viewport`, `device`, `customTags` | Tell baselines of the same name apart |
| `diffTollerancePercent` | Allowed difference, in percent |
| `ignoreAreas` | Areas left out of the comparison |
| `comment` | Shown with the test run |
| `fullScreen` | Full-page screenshot; defaults to the browser helper's `fullPageScreenshots` |
| `retryCount` | Retries while the result is unresolved, default 2 |

Screenshots are uploaded as multipart, so the server's `BODY_PARSER_JSON_LIMIT`
does not apply to them.

## Results and statuses

`vrtTrack` resolves to sdk-js's `TestRunResult`:

- `testRunResponse` holds the server's answer, including `id`, `status` and `url`.
- `imageUrl`, `diffUrl` and `baselineUrl` link to the images.

| Status | Outcome |
| --- | --- |
| `new` | No baseline yet: fails the step, or logs with `enableSoftAssert` |
| `unresolved` | Differs from the baseline: fails the step, or logs with `enableSoftAssert` |
| `ok`, `approved`, `autoApproved` | Passes |
| `failed` | A reviewer rejected it: passes with a warning |
| anything else | Passes with a warning |

## Errors

Request errors name the HTTP status and the server's message, and add a hint for common causes, such as a wrong `apiKey` (401) or an image over the server's limits (413, 422). See [sdk-js](https://github.com/Visual-Regression-Tracker/sdk-js#errors).

## Examples

[examples-js](https://github.com/Visual-Regression-Tracker/examples-js)

## Releasing

Every push to `master` runs [semantic-release](https://semantic-release.gitbook.io). It reads the [Conventional Commits](https://www.conventionalcommits.org) since the last `v*` tag:

| Commit | Release |
| --- | --- |
| `fix:` | patch |
| `feat:` | minor |
| `feat!:` or a `BREAKING CHANGE:` footer | major |
| `chore:`, `ci:`, `docs:`, `test:` | none |

It then publishes to npm through trusted publishing with provenance, tags `vX.Y.Z`, and writes the GitHub release.
The `version` field in `package.json` is a placeholder. The released version lives in the tags and on npm.

### Release candidates

Every push to `next` releases a pre-release of the next version, `X.Y.Z-rc.N` (`6.0.0-rc.1` once a breaking change is in). It goes to npm under the `next` dist-tag, never `latest`: `npm install @visual-regression-tracker/agent-codeceptjs@next` installs the candidate, and a plain install keeps getting the last stable release. Its GitHub release is marked as a pre-release.

Breaking changes go into `next` through pull requests that target it. Merge `master` into `next` when `master` gets new commits.

To release the final version, merge `next` into `master` with a merge commit, not a squash, so that semantic-release still sees the breaking commits. That push releases it to `latest`. The repository deletes merged branches, so create `next` again from `master` before the next round of candidates.

## License

[Apache-2.0](LICENSE)
