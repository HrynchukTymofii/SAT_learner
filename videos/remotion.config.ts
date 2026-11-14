// See https://remotion.dev/docs/config. Only the CLI (studio, `npx remotion render`) reads this file.
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
