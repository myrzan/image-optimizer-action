import { log } from "../utils/logger-utils";
import { OptimizedFileResult, processAvif, processJpgs, processPngs, processSvgs, processWebp } from "../image-optimizer";
import { createPRComment, getPRFileNames } from "../api/github";
import { COMPRESS_AVIF, COMPRESS_JPG, COMPRESS_PNG, COMPRESS_SVG, COMPRESS_WEBP, TEMP_DIR } from "../constants";
import { checkBeforeFileSizes, checkFileSizesAfter, copyFile, moveSignificantFiles } from "../utils/file-utils";
import { setFailed } from '@actions/core';
import { generateReport } from "../report";
import { checkoutBranch, commitAndPush, setupGitConfig } from "../api/git";

const dataMap = new Map<string, OptimizedFileResult>();

export async function run() {
  log('Running pull request');
  await setupGitConfig();

  const branchName = process.env.GITHUB_HEAD_REF;
  log(`Branch name: ${branchName}`);
  if (!branchName) {
    setFailed('No branch name found');
    return;
  }

  await checkoutBranch(branchName);

  const allFiles = await getPRFileNames();
  const svgFiles = allFiles.filter((filename) => filename.endsWith('.svg'));
  const pngFiles = allFiles.filter((filename) => filename.endsWith('.png'));
  const jpgFiles = allFiles.filter((filename) => filename.endsWith('.jpg') || filename.endsWith('.jpeg'));
  const webpFiles = allFiles.filter((filename) => filename.endsWith('.webp'));
  const avifFiles = allFiles.filter((filename) => filename.endsWith('.avif'));

  const allImageFileNames = [];
  const compressionMappings = [
    { flag: COMPRESS_SVG, fileNames: svgFiles },
    { flag: COMPRESS_PNG, fileNames: pngFiles },
    { flag: COMPRESS_JPG, fileNames: jpgFiles },
    { flag: COMPRESS_WEBP, fileNames: webpFiles },
    { flag: COMPRESS_AVIF, fileNames: avifFiles },
  ];

  for (const { flag, fileNames } of compressionMappings) {
    if (flag) {
      allImageFileNames.push(...fileNames);
    }
  }

  if (!allImageFileNames.length) {
    log('No images to optimize');
    return;
  }

  // copy files into temp directory
  for (const fileName of allImageFileNames) {
    copyFile(fileName, `${TEMP_DIR}/${fileName}`);
  }

  log(`Optimizing ${allImageFileNames.length} images`);

  const tempImageFileNames = allImageFileNames.map(
    (file) => `${TEMP_DIR}/${file}`
  );
  await checkBeforeFileSizes(dataMap, tempImageFileNames);

  const imageProcessors = [
    { fileNames: svgFiles, process: processSvgs },
    { fileNames: avifFiles, process: processAvif },
    { fileNames: webpFiles, process: processWebp },
    { fileNames: pngFiles, process: processPngs },
    { fileNames: jpgFiles, process: processJpgs },
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

  const significantFileChanges = Array.from(dataMap.values()).filter(
    (item) => item.isChangeSignificant
  );

  // move over the files that have significant changes
  moveSignificantFiles(significantFileChanges);

  const { markdownReport } = await generateReport(significantFileChanges);
  await commitAndPush(branchName);

  if (markdownReport) {
    await createPRComment(markdownReport);
  }
}




