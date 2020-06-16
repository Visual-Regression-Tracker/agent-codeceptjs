import { Helper } from 'codeceptjs'
import { PlaywrightVisualRegressionTracker, Config } from '@visual-regression-tracker/agent-playwright'
import { DRIVERS } from './interfaces'

export class VisualRegressionTrackerHelper extends Helper {
  private config: Config;
  private helper: any;


  constructor(config: Config) {
    super()
    this.config = config
    this._setHelper();
  }

  /**
    * @param name {String} name of the page you want to track
    * @param diffTollerancePercent {Number} set acceptable difference from baseline, between `0-100`. Default `1`
     */
  async track(name: string, diffTollerancePercent?: number) {
    const page = this.helper.page;
    const browser = this.helper.browser;
    const fullPageScreenshots = this.helper.fullPageScreenshots;

    const vrt = new PlaywrightVisualRegressionTracker(this.config, browser)

    return vrt.track(page, name, {
      diffTollerancePercent,
      screenshotOptions: {
        fullPage: fullPageScreenshots
      }
    });
  }

  private _setHelper() {
    if (this.helpers[DRIVERS.Playwright]) {
      this.helper = this.helpers[DRIVERS.Playwright];
      return;
    }

    throw new Error(
      `Not suported Helper`
    );
  }
}