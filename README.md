# CodeceptJS helper for [Visual Regression Tracker](https://github.com/Visual-Regression-Tracker/Visual-Regression-Tracker)

Adds `I.vrtStart()`, `I.vrtTrack()` and `I.vrtStop()` to [CodeceptJS](https://codecept.io) tests.

## Requirements

- CodeceptJS 3.7+ or 4 (CodeceptJS 4 needs Node.js 22.12+), Node.js 20+
- One of the Playwright, Puppeteer, WebDriver or Appium helpers
- Visual Regression Tracker server 5 or 6

## Install

```sh
npm install --save-dev @visual-regression-tracker/agent-codeceptjs
```

## Configure

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
does not apply to them. A new or unresolved result fails the step, or is only
logged with `enableSoftAssert`.

## Examples

https://github.com/Visual-Regression-Tracker/examples-js
