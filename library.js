const {execute} = require('./util');

/***
 * @description Code to prevent GitHub from suspending your cronjob based triggers due to repository inactivity
 * @param {string} githubToken - Token of the GitHub user to create dummy commit
 * @param {string} committerUsername - Username of the GitHub user to create dummy commit
 * @param {string} committerEmail - Email id of the GitHub user to create dummy commit
 * @param {string} commitMessage - Commit message while doing dummy commit
 * @param {number} timeElapsed - Time elapsed from the last commit to trigger a new automated commit (in days). Default: 50
 * @param {boolean} autoPush - Boolean flag to define if the library should automatically push the changes. Default: false
 * @return {Promise<string>} - Promise with success or failure message
 */
const KeepAliveWorkflow = async (githubToken, committerUsername, committerEmail, commitMessage, timeElapsed = 50, autoPush = false) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Calculating the last commit date
      const {outputData} = await execute('git', ['--no-pager', 'log', '-1', '--format=%ct'],
        {encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']});

      const commitDate = new Date(parseInt(outputData, 10) * 1000);
      const diffInDays = Math.round((new Date() - commitDate) / (1000 * 60 * 60 * 24));

      if (diffInDays > timeElapsed) {
        // Do dummy commit if elapsed time is greater than 50 (default) days
        await execute('git', [
          'config',
          '--global',
          'user.email',
          committerEmail,
        ]);
        await execute('git', [
          'remote',
          'set-url',
          'origin',
          `https://x-access-token:${githubToken}@${process.env.GITHUB_SERVER_URL.replace(/^https?:\/\//, '')}/${process.env.GITHUB_REPOSITORY}.git`
        ]);
        await execute('git', [
          'config',
          '--global',
          'user.name',
          committerUsername
        ]);
        await execute('git', [
          'commit',
          '--allow-empty',
          '-m',
          `${commitMessage}`]);
        if (autoPush) {
          await execute('git', [
            'push',
            'origin',
            'HEAD']);
        }
        resolve('Dummy commit created to keep the repository active...');
      } else {
        resolve('Nothing to do...');
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  KeepAliveWorkflow
};
