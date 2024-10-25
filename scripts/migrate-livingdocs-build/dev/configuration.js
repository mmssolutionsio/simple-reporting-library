import configurationDefaults from './configuration-defaults.js';
import _ from 'lodash';

/*
import fs from "fs";
import path from "path";


let jsonPackageConfiguration;
const jsonpath = path.normalize(process.cwd() + "/package.json");

try {
  jsonPackageConfiguration = JSON.parse(fs.readFileSync(jsonpath).toString());
} catch (error) {
  throw {
    message: "package json not found at " + jsonpath,
    type: "error",
    error: error,
  };
}

const packageConfiguration = jsonPackageConfiguration["nhs-design-builder"] ? jsonPackageConfiguration["nhs-design-builder"] : {};

 */
const packageConfiguration = {};
const configuration = _.merge(configurationDefaults, packageConfiguration);

/*
if (!!packageConfiguration?.build?.requiredFolders) {
  configuration.build.requiredFolders = packageConfiguration.build.requiredFolders;
}
 */

export default configuration;
