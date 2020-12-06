# Native integration for [CodeceptJS](https://github.com/codecept-js/CodeceptJS) with [Visual Regression Tracker](https://github.com/Visual-Regression-Tracker/Visual-Regression-Tracker)

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/3a106c1256144665ad0ab3148fb0f1e8)](https://www.codacy.com/gh/Visual-Regression-Tracker/agent-codeceptjs?utm_source=github.com&utm_medium=referral&utm_content=Visual-Regression-Tracker/agent-codeceptjs&utm_campaign=Badge_Grade)

## Npm

https://www.npmjs.com/package/@visual-regression-tracker/agent-codeceptjs

## Install

### Add package

`npm install @visual-regression-tracker/agent-codeceptjs`

### Add helper

Update `codeceptjs.conf.js`

```js
helpers: {
    VisualRegressionTrackerHelper: {
        require: "@visual-regression-tracker/agent-codeceptjs",

        // URL where backend is running
        // Required
        apiUrl: "http://localhost:4200",

        // Project name or ID
        // Required
        project: "Default project",

        // User apiKey
        // Required
        apiKey: "tXZVHX0EA4YQM1MGDD",

        // Current git branch
        // Required
        branchName: "develop",

        // Log errors instead of throwing exceptions
        // Optional - default false
        enableSoftAssert: true,

        // Unique ID related to one CI build
        // Optional - default null
        ciBuildId: "SOME_UNIQUE_ID",
    },
}
```

### Update TypeScript Definitions

More on this in official COdeceptJS (docs)[https://codecept.io/commands/#typescript-definitions]

`npx codeceptjs def`

## Usage

### Setup

```js
I.vrtStart();
```

### Teardown

```js
I.vrtStop();
```

### Assert

```js
// default
I.vrtTrack("Default");

// With additional options
I.vrtTrack("Additional options", {
  os: "windows",
  device: "device",
  browser: "chrome",
  diffTollerancePercent: 1,
  ignoreAreas: [
    {
      x: 10,
      y: 10,
      width: 200,
      height: 200,
    },
  ],
});
```

## Examples

https://github.com/Visual-Regression-Tracker/examples-js
