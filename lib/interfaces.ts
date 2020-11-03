import { IgnoreArea } from "@visual-regression-tracker/sdk-js";

export interface TrackOptions {
  diffTollerancePercent?: number;
  os?: string;
  browser?: string;
  viewport?: string;
  device?: string;
  fullScreen?: boolean;
  ignoreAreas?: IgnoreArea[];
}
