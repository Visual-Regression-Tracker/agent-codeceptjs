import { type } from "os";

export enum DRIVERS {
    Playwright = 'Playwright',
    Puppeteer = 'Puppeteer',
    WebDriver = 'WebDriver',
    Appium = 'Appium',
    WebDriverIO = 'WebDriverIO',
    TestCafe = 'TestCafe',
}

export interface TrackOptions {
    diffTollerancePercent?: number;
    os?: string;
    browser?: string;
    viewport?: string;
    device?: string;
    fullScreen?: boolean;
}