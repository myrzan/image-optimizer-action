import { log } from '../utils/logger-utils';
import { exec, getExecOutput } from '@actions/exec';

export async function setupGitConfig() {
  await exec('git config --global user.name github-actions[bot]');
  await exec(
    'git config --global user.email 41898282+github-actions[bot]@users.noreply.github.com',
  );
  await exec('git config --global --add safe.directory /github/workspace');
}

export async function checkoutBranch(branchName: string) {
  await exec(`git fetch origin ${branchName}`);
  await exec(`git checkout ${branchName}`);
}

export async function commitAndPush(branchName: string) {
  await exec('git add .');

  // Получаем название текущей ветки
  const { stdout: branchNameRaw } = await getExecOutput('git rev-parse --abbrev-ref HEAD');
  const currentBranch = branchNameRaw.trim();

  const commitMessage = `${currentBranch} оптимизация изображений`;

  log(`Committing changes with message: "${commitMessage}"`);
  await exec('sh', ['-c', `git commit -m "${commitMessage}"`]);

  log('Pushing changes to the branch');
  await exec(`git push origin HEAD:${branchName}`);
}
