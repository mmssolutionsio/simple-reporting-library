import configuration from '../configuration.js';
import lib from '../lib.js';
import fs from 'fs';

const BuildV2 = (designData, components) => {
  // critical tests
  lib.testComponentExistV2(designData, components);
  lib.testPropertyExistV2(designData, components);

  // logs when thing is never used
  lib.testComponentsAllUsedV2(designData, components);
  lib.testDesignPropertiesV2(designData, components);

  // cleanup dist and dest zip
  lib.removeFolder(configuration.build.dist);
  lib.removeFile(configuration.build.dest + configuration.build.archiveName);

  // create and make dist
  fs.mkdirSync(configuration.build.dist);

  // copy folders
  configuration.build.requiredFolders.forEach((folder) => {
    const splitPath = folder.split('/');
    fs.cpSync(
      folder,
      configuration.build.dist + '/' + splitPath[splitPath.length - 1],
      { recursive: true },
    );
  });

  const newDesignData = lib.mergeDesignV2(designData, components);

  // write json files
  fs.writeFileSync(
    configuration.build.dist + '/design.json',
    JSON.stringify(newDesignData),
  );
  fs.writeFileSync(
    configuration.build.dist + '/design.js',
    `(function () { var designJSON = ${JSON.stringify(newDesignData)}; if(typeof module !== 'undefined' && module.exports) {return module.exports = designJSON;} else { this.design = this.design || {}; this.design['${newDesignData.name}'] = designJSON;} }).call(this);`,
  );
};

export default BuildV2;
