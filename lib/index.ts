import Helper from "@codeceptjs/helper";
import { randomUUID } from "crypto";
import { rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import {
  Config,
  VisualRegressionTracker,
  readConfigFromEnv,
  readConfigFromFile,
} from "@visual-regression-tracker/sdk-js";
import {
  HelperConfig,
  PageHelper,
  TrackOptions,
  WebDriverHelper,
} from "./interfaces";

class VisualRegressionTrackerHelper extends Helper {
  private vrt: VisualRegressionTracker;

  constructor(config: HelperConfig = {}) {
    super(config);
    const { require: _, ...helperConfig } = config;
    // sdk-js skips vrt.json and VRT_* variables when given an explicit config
    const fallback = readConfigFromEnv(readConfigFromFile({} as Config));
    const defined = Object.fromEntries(
      Object.entries(helperConfig).filter(([, value]) => value !== undefined),
    );
    this.vrt = new VisualRegressionTracker({
      ...fallback,
      ...defined,
      sourceBranch:
        helperConfig.sourceBranch ||
        helperConfig.baselineBranchName ||
        fallback.sourceBranch,
    });
  }

  async vrtStart() {
    return this.vrt.start();
  }

  async vrtStop() {
    return this.vrt.stop();
  }

  async vrtTrack(name: string, options: TrackOptions = {}) {
    const { fullScreen, retryCount, ...testRun } = options;

    const pageHelper: PageHelper | undefined =
      this.helpers.Playwright ?? this.helpers.Puppeteer;
    if (pageHelper) {
      const imageBuffer = Buffer.from(
        await pageHelper.page.screenshot({
          fullPage: fullScreen ?? pageHelper.options?.fullPageScreenshots,
          type: "png",
        }),
      );
      return this.vrt.track({ ...testRun, name, imageBuffer }, retryCount);
    }

    // WebDriver's saveScreenshot does its own full-page stitching, so reuse it via a temp file
    const webDriver: WebDriverHelper | undefined =
      this.helpers.WebDriver ?? this.helpers.Appium;
    if (webDriver) {
      const imagePath = join(tmpdir(), `vrt-${randomUUID()}.png`);
      try {
        await webDriver.saveScreenshot(imagePath, fullScreen);
        return await this.vrt.track(
          { ...testRun, name, imagePath },
          retryCount,
        );
      } finally {
        await rm(imagePath, { force: true });
      }
    }

    throw new Error(
      "VisualRegressionTrackerHelper needs the Playwright, Puppeteer, WebDriver or Appium helper",
    );
  }
}

export = VisualRegressionTrackerHelper;
