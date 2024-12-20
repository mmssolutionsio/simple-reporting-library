import configuration from '../configuration.js';
import fs from 'fs';
import archiver from 'archiver';
import logger from '../logger.js';

const zipArchive = () => {
  // zip em up
  var output = fs.createWriteStream(
    `${configuration.build.dest}/${configuration.build.archiveName}`,
  );

  output.on('close', function () {
    logger.info('Archiver: ' + archive.pointer() + ' total bytes');
    logger.info(
      'Archiver has been finalized and the output file descriptor has closed.',
    );
  });

  var archive = archiver('zip');

  archive.on('error', (err) => {
    logger.error(err);
    throw {
      message: 'failed to create archive',
      error: err,
    };
    // throw err;
  });

  archive.pipe(output);

  // append files from a sub-directory, putting its contents at the root of archive
  archive.directory(configuration.build.dist, false);
  archive.finalize();

  return;
};

export default zipArchive;
