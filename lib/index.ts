/* global codecept_helper */

const Helper = codecept_helper;
import { TrackOptions } from "./interfaces";
import { unlinkSync } from "fs";
import { join } from "path";
import {
  VisualRegressionTracker,
  Config,
} from "@visual-regression-tracker/sdk-js";

enum DRIVERS {
  Playwright = "Playwright",
  Puppeteer = "Puppeteer",
  WebDriver = "WebDriver",
  Appium = "Appium",
  WebDriverIO = "WebDriverIO",
  TestCafe = "TestCafe",
}

class VisualRegressionTrackerHelper extends Helper {
  private vrt: VisualRegressionTracker;

  constructor(config: Config) {
    super();
    this.vrt = new VisualRegressionTracker(config);
  }

  async vrtStart() {
    return this.vrt.start();
  }

  async vrtStop() {
    return this.vrt.stop();
  }

  /**
   * @param name {String} name of the page you want to track
   * @param options {TrackOptions} options
   */
  async vrtTrack(name: string, options: TrackOptions) {
    const helper = this._getHelper();
    const filepath = join(__dirname, `${name}-${Date.now()}.png`);
    const image = await helper.saveScreenshot(filepath, options?.fullScreen);
    unlinkSync(filepath);

    return this.vrt.track({
      name,
      imageBase64: image.toString("base64"),
      ...options,
    });
  }

  private _getHelper(): any {
    if (this.helpers[DRIVERS.Puppeteer]) {
      return this.helpers[DRIVERS.Puppeteer];
    }
    if (this.helpers[DRIVERS.WebDriver]) {
      return this.helpers[DRIVERS.WebDriver];
    }
    if (this.helpers[DRIVERS.Appium]) {
      return this.helpers[DRIVERS.Appium];
    }
    if (this.helpers[DRIVERS.WebDriverIO]) {
      return this.helpers[DRIVERS.WebDriverIO];
    }
    if (this.helpers[DRIVERS.TestCafe]) {
      return this.helpers[DRIVERS.TestCafe];
    }
    if (this.helpers[DRIVERS.Playwright]) {
      return this.helpers[DRIVERS.Playwright];
    }

    throw new Error("Not supported driver");
  }
}

export = VisualRegressionTrackerHelper;
