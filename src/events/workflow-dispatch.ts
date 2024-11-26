import { log } from "../utils/logger-utils";
import { checkBeforeFileSizes, checkFileSizesAfter, copyFile, findAllFiles, moveSignificantFiles } from "../utils/file-utils";
import { OptimizedFileResult, processAvif, processJpgs, processPngs, processSvgs, processWebp } from "../image-optimizer";
import { COMPRESS_AVIF, COMPRESS_JPG, COMPRESS_PNG, COMPRESS_SVG, COMPRESS_WEBP, PR_BODY_CHAR_LIMIT, TEMP_DIR } from "../constants";
import { generateReport } from "../report";

const dataMap = new Map<string, OptimizedFileResult>();
const allFiles = findAllFiles('.');
log('allFiles')
allFiles.forEach((file) => log(file));

const svgFileNames = allFiles.filter((filename) => filename.endsWith('.svg'));
const pngFileNames = allFiles.filter((filename) => filename.endsWith('.png'));
const jpgFileNames = allFiles.filter((filename) => filename.endsWith('.jpg') || filename.endsWith('.jpeg'));
const webpFileNames = allFiles.filter((filename) => filename.endsWith('.webp'));
const avifFileNames = allFiles.filter((filename) => filename.endsWith('.avif'));

export async function run() {
  log('Running workflow dispatch');

  const allImageFileNames = [];
  const compressionMappings = [
    { flag: COMPRESS_SVG, fileNames: svgFileNames },
    { flag: COMPRESS_PNG, fileNames: pngFileNames },
    { flag: COMPRESS_JPG, fileNames: jpgFileNames },
    { flag: COMPRESS_WEBP, fileNames: webpFileNames },
    { flag: COMPRESS_AVIF, fileNames: avifFileNames },
  ];

  for (const { flag, fileNames } of compressionMappings) {
    if (flag) {
      allImageFileNames.push(...fileNames);
    }
  }

  // copy files into temp directory
  for (const fileName of allImageFileNames) {
    log(`Copying file: ${fileName} into ${TEMP_DIR}/${fileName}`);
    copyFile(fileName, `${TEMP_DIR}/${fileName}`);
  }

  const tempImageFileNames = allImageFileNames.map(
    (file) => `${TEMP_DIR}/${file}`
  );
  await checkBeforeFileSizes(dataMap, tempImageFileNames);

  const imageProcessors = [
    { fileNames: svgFileNames, process: processSvgs },
    { fileNames: avifFileNames, process: processAvif },
    { fileNames: webpFileNames, process: processWebp },
    { fileNames: pngFileNames, process: processPngs },
    { fileNames: jpgFileNames, process: processJpgs },
  ];

  for (const { fileNames, process } of imageProcessors) {
    if (fileNames.length) {
      await process();
    }
  }

  const changed = checkFileSizesAfter(dataMap);

  if (!changed) {
    log('No changes in file sizes');
    return;
  }

  const significantFileChanges = Array.from(dataMap.values()).filter((item) => item.isChangeSignificant);

  // move over the files that have significant changes
  moveSignificantFiles(significantFileChanges);
  await generateReport(significantFileChanges);
}
