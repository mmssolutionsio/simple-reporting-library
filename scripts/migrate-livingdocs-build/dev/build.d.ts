export default Build;
declare namespace Build {
    export { BuildV1 };
    export { BuildV2 };
    export { zipArchive };
}
import BuildV1 from './build/v1.js';
import BuildV2 from './build/v2.js';
import zipArchive from './build/zip-archive.js';
