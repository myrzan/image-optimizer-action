import { info } from '@actions/core';
import { DEBUG } from '../constants';

export function log(msg: string) {
  if (!DEBUG) {
    return;
  }

  info(`[DEBUG]: ${msg}`);
}
