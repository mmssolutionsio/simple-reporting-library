import configuration from '../configuration.js';
import lib from '../lib.js';
import fs from 'fs';

/**
 * Builds and packages a design version.
 *
 * @param {object} designData - The design data object.
 * @param {object} components - The components object.
 * @returns {void}
 */
const BuildV1 = (designData, components) => {
  // critical tests
  lib.testComponentExistV1(designData, components);
  lib.testPropertyExistV1(designData, components);

  // // logs when thing is never used
  lib.testComponentsAllUsedV1(designData, components);
  lib.testDesignPropertiesV1(designData, components);

  // // cleanup dist and dest zip
  lib.removeFolder(configuration.build.dist);
  lib.removeFile(configuration.build.dest + configuration.build.archiveName);

  // // create and make dist
  fs.mkdirSync(configuration.build.dist);

  // // copy folders
  configuration.build.requiredFolders.forEach((folder) => {
    const splitPath = folder.split('/');
    fs.cpSync(
      folder,
      configuration.build.dist + '/' + splitPath[splitPath.length - 1],
      { recursive: true },
    );
  });

  const newDesignData = lib.mergeDesignV1(designData, components);

  // // write json files
  fs.writeFileSync(
    configuration.build.dist + '/design.json',
    JSON.stringify(newDesignData),
  );
  fs.writeFileSync(
    configuration.build.dist + '/design.js',
    `(function () { var designJSON = ${JSON.stringify(newDesignData)}; if(typeof module !== 'undefined' && module.exports) {return module.exports = designJSON;} else { this.design = this.design || {}; this.design['${newDesignData.name}'] = designJSON;} }).call(this);`,
  );
};

export default BuildV1;
