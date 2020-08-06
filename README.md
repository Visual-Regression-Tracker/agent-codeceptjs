# Native integration for [CodeceptJS](https://github.com/codecept-js/CodeceptJS) with [Visual Regression Tracker](https://github.com/Visual-Regression-Tracker/Visual-Regression-Tracker)

## Install

### Add package

`npm install @visual-regression-tracker/agent-codeceptjs`

### Add helper

Update `codeceptjs.conf.js`

```js
helpers: {
    VisualRegressionTrackerHelper: {
        // apiUrl - URL where backend is running
        "apiUrl": "http://localhost:4200",

        // project - Project name or ID
        "project": "Default project",

        // apiKey - User apiKey
        "apiKey": "F3GCS56KVA4168HAN53YN31ASSVG",

        // branch - Current git branch
        "branchName": "develop"
    },
}
```

## Usage

Default

```js
I.track("Default");
```

With additional options

```js
I.track("Additional options", {
  os: "windows",
  device: "device",
  browser: "chrome",
  diffTollerancePercent: 13,
});
```

## Examples

https://github.com/Visual-Regression-Tracker/examples-js
