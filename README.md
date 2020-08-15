# Native integration for [CodeceptJS](https://github.com/codecept-js/CodeceptJS) with [Visual Regression Tracker](https://github.com/Visual-Regression-Tracker/Visual-Regression-Tracker)

## Install

### Add package

`npm install @visual-regression-tracker/agent-codeceptjs`

### Add helper

Update `codeceptjs.conf.js`

```js
helpers: {
    VisualRegressionTrackerHelper: {
        require: "@visual-regression-tracker/agent-codeceptjs",

        // apiUrl - URL where backend is running
        apiUrl: "http://localhost:4200",

        // project - Project name or ID
        project: "Default project",

        // apiKey - User apiKey
        apiKey: "F3GCS56KVA4168HAN53YN31ASSVG",

        // branch - Current git branch
        branchName: "develop"
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

```js
// default
I.vrtTrack("Default");

// With additional options
I.vrtTrack("Additional options", {
  os: "windows",
  device: "device",
  browser: "chrome",
  diffTollerancePercent: 1,
});
```

### Setup

```js
I.vrtStop();
```

## Examples

https://github.com/Visual-Regression-Tracker/examples-js
