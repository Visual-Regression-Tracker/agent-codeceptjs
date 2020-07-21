import { Helper } from 'codeceptjs';
import { PlaywrightVisualRegressionTracker, Config } from '@visual-regression-tracker/agent-playwright'
import { DRIVERS, TrackOptions } from './interfaces'
import { unlink, unlinkSync } from 'fs';
import { join } from 'path';
import { Build, VisualRegressionTracker, TestRun, } from '@visual-regression-tracker/sdk-js';

class VisualRegressionTrackerHelper extends Helper {
  private vrt: VisualRegressionTracker;

  constructor(config: Config) {
    super();
    this.vrt = new VisualRegressionTracker(config)
  }

  /**
    * @param name {String} name of the page you want to track
    * @param diffTollerancePercent {Number} set acceptable difference from baseline, between `0-100`. Default `1`
     */
  async track(name: string, options: TrackOptions) {

    const helper = this._getHelper()
    const filepath = join(__dirname, `${name}-${Date.now()}.png`);
    const image = await helper.saveScreenshot(filepath, options.fullScreen)
    unlinkSync(filepath)

    return this.vrt.track({
      name,
      imageBase64: image.toString("base64"),
      ...options
    })
  }


  _getHelper(): any {
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

    throw new Error('Not supported driver');
  }
}

export default VisualRegressionTrackerHelper