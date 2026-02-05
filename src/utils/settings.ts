import path from "path";

const appPathLink = path.resolve();

interface Settings {
  appPath: string;
  publicPath: string;
  tmpPath: string;
  logPath: string;
  cookieSecret: string;
}

const commonSettings = {
  appPath: appPathLink,
  publicPath: `${appPathLink}/public`,
  tmpPath: `${appPathLink}/temp`,
  logPath: `${appPathLink}/logs`,
  cookieSecret: "f0rMCO0k!e$3cR37",
};

let settings: Settings = commonSettings;

export const { appPath, publicPath, tmpPath, logPath, cookieSecret } = settings;

export default settings;
