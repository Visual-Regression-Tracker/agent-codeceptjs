import { Config, TestRunBuffer } from "@visual-regression-tracker/sdk-js";

export interface HelperConfig extends Partial<Config> {
  require?: string;
}

export interface TrackOptions extends Omit<
  TestRunBuffer,
  "name" | "imageBuffer"
> {
  fullScreen?: boolean;
  retryCount?: number;
}

export interface PageHelper {
  page: {
    screenshot(options: {
      fullPage?: boolean;
      type: "png";
    }): Promise<Uint8Array>;
  };
  options?: { fullPageScreenshots?: boolean };
}

export interface WebDriverHelper {
  saveScreenshot(fileName: string, fullPage?: boolean): Promise<unknown>;
}
