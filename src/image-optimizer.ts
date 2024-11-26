import {
  COMPRESS_AVIF,
  COMPRESS_JPG,
  COMPRESS_PNG,
  COMPRESS_SVG,
  COMPRESS_WEBP,
  EXPORT_AVIF,
  EXPORT_WEBP,
  TEMP_DIR,
} from './constants';
import { exec } from '@actions/exec';

export interface OptimizedFileResult {
  fileName: string;
  fileSizeBefore: number;
  fileSizeAfter?: number;
  percentageChange: number;
  isChangeSignificant?: boolean;
}

export async function processSvgs() {
  if (!COMPRESS_SVG) {
    return;
  }

  try {
    await exec(`npx svgo --multipass -r ${TEMP_DIR}`);
  } catch (err) {
    console.error(`Error processing svgs:`, err);
  }
}

export async function processWebp() {
  if (COMPRESS_WEBP) {
    try {
      await exec(`npx sharp-cli -i ${TEMP_DIR}/**/*.webp -o {dir}`);
    } catch (err) {
      console.error(`Error exporting webps:`, err);
    }
  }

  if (EXPORT_AVIF) {
    try {
      await exec(`npx sharp-cli -i ${TEMP_DIR}/**/*.webp -f avif -o {dir}`);
    } catch (error) {
      console.error(`Error exporting avifs:`, error);
    }
  }
}

export async function processAvif() {
  if (COMPRESS_AVIF) {
    try {
      await exec(`npx sharp-cli -i ${TEMP_DIR}/**/*.avif -o {dir}`);
    } catch (error) {
      console.error(`Error exporting avifs:`, error);
    }
  }
}

export async function processJpgs() {
  if (COMPRESS_JPG) {
    try {
      await exec(
        `npx sharp-cli -i ${TEMP_DIR}/**/*.{jpg,jpeg} -f jpg -o {dir} --progressive`
      );
    } catch (err) {
      console.error(`Error exporting jpgs:`, err);
    }
  }

  if (EXPORT_WEBP) {
    try {
      await exec(
        `npx sharp-cli -i ${TEMP_DIR}/**/*.{jpg,jpeg} -f webp -o {dir}`
      );
    } catch (err) {
      console.error(`Error converting jpg into webp:`, err);
    }
  }

  if (EXPORT_AVIF) {
    try {
      await exec(
        `npx sharp-cli -i ${TEMP_DIR}/**/*.{jpg,jpeg} -f avif -o {dir}`
      );
    } catch (error) {
      console.error(`Error converting jpg avif:`, error);
    }
  }
}

export async function processPngs() {
  if (COMPRESS_PNG) {
    try {
      await exec(`npx sharp-cli -i ${TEMP_DIR}/**/*.png -o {dir}`);
    } catch (err) {
      console.error(`Error processing pngs:`, err);
    }
  }

  if (EXPORT_WEBP) {
    try {
      await exec(`npx sharp-cli -i ${TEMP_DIR}/**/*.png -f webp -o {dir}`);
    } catch (err) {
      console.error(`Error exporting webps:`, err);
    }
  }

  if (EXPORT_AVIF) {
    try {
      await exec(`npx sharp-cli -i ${TEMP_DIR}/**/*.png -f avif -o {dir}`);
    } catch (error) {
      console.error(`Error exporting avifs:`, error);
    }
  }
}
