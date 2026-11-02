import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import * as sdk from "@visual-regression-tracker/sdk-js";
import VisualRegressionTrackerHelper from "./index";

jest.mock("@visual-regression-tracker/sdk-js");

const { VisualRegressionTracker } = sdk;
const actualSdk = jest.requireActual<typeof sdk>(
  "@visual-regression-tracker/sdk-js",
);

const config = {
  apiUrl: "http://localhost:4200",
  branchName: "develop",
  project: "Default project",
  apiKey: "BAZ0EG0PRH4CRQPH19ZKAVADBP9E",
  enableSoftAssert: false,
};
const image = Buffer.from("image mocked");

const INIT_ENV = process.env;
let helpers: Record<string, unknown>;

beforeEach(() => {
  jest.resetAllMocks();
  jest
    .mocked(sdk.readConfigFromFile)
    .mockImplementation(actualSdk.readConfigFromFile);
  jest
    .mocked(sdk.readConfigFromEnv)
    .mockImplementation(actualSdk.readConfigFromEnv);
  process.env = {};
  helpers = {};
  (global as any).codeceptjs = { container: { helpers: () => helpers } };
});

afterAll(() => {
  process.env = INIT_ENV;
  delete (global as any).codeceptjs;
});

describe("constructor", () => {
  it("passes the helper config without require", () => {
    new VisualRegressionTrackerHelper({ require: "agent", ...config });

    expect(VisualRegressionTracker).toHaveBeenCalledWith(config);
  });

  it("fills settings missing from the helper config from VRT_* variables", () => {
    process.env = {
      VRT_APIURL: "http://env:4200",
      VRT_BRANCHNAME: "feature",
      VRT_SOURCEBRANCH: "release",
    };

    new VisualRegressionTrackerHelper({
      require: "agent",
      apiUrl: config.apiUrl,
    });

    expect(VisualRegressionTracker).toHaveBeenCalledWith({
      apiUrl: config.apiUrl,
      branchName: "feature",
      sourceBranch: "release",
    });
  });

  it("keeps VRT_* values for helper settings that are undefined", () => {
    process.env = { VRT_BRANCHNAME: "feature" };

    new VisualRegressionTrackerHelper({ ...config, branchName: undefined });

    expect(VisualRegressionTracker).toHaveBeenCalledWith({
      ...config,
      branchName: "feature",
    });
  });

  it("prefers baselineBranchName from the helper config over VRT_SOURCEBRANCH", () => {
    process.env = { VRT_SOURCEBRANCH: "release" };

    new VisualRegressionTrackerHelper({
      ...config,
      baselineBranchName: "develop",
    });

    expect(VisualRegressionTracker).toHaveBeenCalledWith({
      ...config,
      baselineBranchName: "develop",
      sourceBranch: "develop",
    });
  });

  it("reads everything from VRT_* variables without helper settings", () => {
    process.env = {
      VRT_APIURL: config.apiUrl,
      VRT_BRANCHNAME: config.branchName,
      VRT_PROJECT: config.project,
      VRT_APIKEY: config.apiKey,
      VRT_ENABLESOFTASSERT: "false",
    };

    new VisualRegressionTrackerHelper();

    expect(VisualRegressionTracker).toHaveBeenCalledWith(config);
  });
});

describe("build", () => {
  it("vrtStart starts the build", async () => {
    const build = { id: "build" };
    jest
      .mocked(VisualRegressionTracker.prototype.start)
      .mockResolvedValue(build as any);

    await expect(
      new VisualRegressionTrackerHelper(config).vrtStart(),
    ).resolves.toBe(build);
  });

  it("vrtStop stops the build", async () => {
    await new VisualRegressionTrackerHelper(config).vrtStop();

    expect(VisualRegressionTracker.prototype.stop).toHaveBeenCalled();
  });
});

describe("vrtTrack", () => {
  const pageHelper = (options?: object) => ({
    page: { screenshot: jest.fn().mockResolvedValue(new Uint8Array(image)) },
    options,
  });

  it("tracks a Playwright screenshot with every option", async () => {
    const playwright = pageHelper();
    helpers.Playwright = playwright;
    const result = { testRunResponse: { status: "ok" } };
    jest
      .mocked(VisualRegressionTracker.prototype.track)
      .mockResolvedValue(result as any);
    const testRun = {
      os: "linux",
      browser: "chromium",
      viewport: "1280x720",
      device: "PC",
      customTags: "smoke",
      diffTollerancePercent: 1.5,
      ignoreAreas: [{ x: 1, y: 2, width: 3, height: 4 }],
      comment: "comment",
    };

    await expect(
      new VisualRegressionTrackerHelper(config).vrtTrack("home", {
        ...testRun,
        fullScreen: true,
        retryCount: 0,
      }),
    ).resolves.toBe(result);

    expect(playwright.page.screenshot).toHaveBeenCalledWith({
      fullPage: true,
      type: "png",
    });
    expect(VisualRegressionTracker.prototype.track).toHaveBeenCalledWith(
      { ...testRun, name: "home", imageBuffer: image },
      0,
    );
  });

  it("tracks with defaults when no options are given", async () => {
    helpers.Playwright = pageHelper();

    await new VisualRegressionTrackerHelper(config).vrtTrack("home");

    expect(VisualRegressionTracker.prototype.track).toHaveBeenCalledWith(
      { name: "home", imageBuffer: image },
      undefined,
    );
  });

  it.each([
    [undefined, true],
    [false, false],
  ])(
    "with fullScreen %s and fullPageScreenshots in the helper config takes fullPage %s",
    async (fullScreen, fullPage) => {
      const puppeteer = pageHelper({ fullPageScreenshots: true });
      helpers.Puppeteer = puppeteer;

      await new VisualRegressionTrackerHelper(config).vrtTrack("home", {
        fullScreen,
      });

      expect(puppeteer.page.screenshot).toHaveBeenCalledWith({
        fullPage,
        type: "png",
      });
    },
  );

  it("propagates errors from sdk-js", async () => {
    helpers.Playwright = pageHelper();
    jest
      .mocked(VisualRegressionTracker.prototype.track)
      .mockRejectedValue(new Error("Difference found"));

    await expect(
      new VisualRegressionTrackerHelper(config).vrtTrack("home"),
    ).rejects.toThrow("Difference found");
  });

  describe.each(["WebDriver", "Appium"])("with %s", (name) => {
    let file: string;
    let saveScreenshot: jest.Mock;

    beforeEach(() => {
      file = "";
      saveScreenshot = jest.fn(async (fileName: string) => {
        file = fileName;
        await writeFile(fileName, image);
      });
      helpers[name] = { saveScreenshot };
    });

    it("tracks the saved screenshot file and removes it", async () => {
      let tracked: Buffer | undefined;
      jest
        .mocked(VisualRegressionTracker.prototype.track)
        .mockImplementation(async (test) => {
          tracked = await readFile((test as sdk.TestRunMultipart).imagePath);
          return {} as any;
        });

      await new VisualRegressionTrackerHelper(config).vrtTrack("home", {
        fullScreen: true,
      });

      expect(saveScreenshot).toHaveBeenCalledWith(file, true);
      expect(VisualRegressionTracker.prototype.track).toHaveBeenCalledWith(
        { name: "home", imagePath: file },
        undefined,
      );
      expect(tracked).toEqual(image);
      expect(existsSync(file)).toBe(false);
    });

    it("removes the screenshot file when tracking fails", async () => {
      jest
        .mocked(VisualRegressionTracker.prototype.track)
        .mockRejectedValue(new Error("boom"));

      await expect(
        new VisualRegressionTrackerHelper(config).vrtTrack("home"),
      ).rejects.toThrow("boom");

      expect(existsSync(file)).toBe(false);
    });
  });

  it("fails without a supported browser helper", async () => {
    helpers.REST = {};

    await expect(
      new VisualRegressionTrackerHelper(config).vrtTrack("home"),
    ).rejects.toThrow(
      "needs the Playwright, Puppeteer, WebDriver or Appium helper",
    );
    expect(VisualRegressionTracker.prototype.track).not.toHaveBeenCalled();
  });
});
