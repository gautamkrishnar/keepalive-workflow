const {execute, getDiffInDays, writeDetectionCheck} = require('./util');
const { Octokit } = require("@octokit/rest");


/***
 * Code to prevent GitHub from suspending your cronjob based triggers due to repository inactivity.
 * This function uses dummy commits to keep the repository alive. If you dont want dummy commits in your git history,
 * use the alternative function `APIKeepAliveWorkflow`
 * @async
 * @param {string} githubToken - Token of the GitHub user to create dummy commit
 * @param {string} committerUsername - Username of the GitHub user to create dummy commit
 * @param {string} committerEmail - Email id of the GitHub user to create dummy commit
 * @param {string} commitMessage - Commit message while doing dummy commit
 * @param {number} [timeElapsed=50] - Time elapsed from the last commit to trigger a new automated commit (in days). Default: 50
 * @param {boolean} [autoPush=false] - Boolean flag to define if the library should automatically push the changes. Default: false
 * @param {boolean} [autoWriteCheck=false] - Enables automatic checking of the token for branch protection rules
 * @return {Promise<string, Error>} - Promise with success message or failure object
 */
const KeepAliveWorkflow = async (githubToken, committerUsername, committerEmail, commitMessage, timeElapsed = 50, autoPush = false, autoWriteCheck = false) => {
  return new Promise(async (resolve, reject) => {
    try {
      writeDetectionCheck(autoWriteCheck, reject);
      const diffInDays = await getDiffInDays();
      if (diffInDays >= timeElapsed) {
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


/**
 * @typedef APIKeepAliveWorkflowOptions
 * @property {string|null} [workflowFile=null] - Action file name to keepalive eg: `test.yaml'. If you omit this parameter,
 * the script will automatically figure it out from the current run metadata.
 * @property {string} [apiBaseUrl=process.env.GITHUB_API_URL] - API Base url. Change this if you are using GitHub enterprise hosted version.
 * @property {number} [timeElapsed=50] - Time elapsed from the last commit to trigger a new automated commit (in days). Default: 50
 * @property {boolean} [autoWriteCheck=false] - Enables automatic checking of the token for branch protection rules
 */

/***
 * Code to prevent GitHub from suspending your cronjob based triggers due to repository inactivity
 * This code uses GitHub Actions API to keep the repository alive:
 * https://docs.github.com/en/rest/actions/workflows?apiVersion=2022-11-28#enable-a-workflow
 * @async
 * @param {string} githubToken - Token of the GitHub user to call the API. It should have `actions:write` permission set
 * @param {APIKeepAliveWorkflowOptions} [options] - Configuration options
 * @return {Promise<string, Error>} - Promise with success message or failure object
 */
const APIKeepAliveWorkflow = (githubToken,
                              {
                                workflowFile = null,
                                apiBaseUrl= (
                                  (!!process.env.GITHUB_API_URL) ?
                                    process.env.GITHUB_API_URL : 'https://api.github.com'
                                ),
                                timeElapsed = 50,
                                autoWriteCheck = false
                              } = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      writeDetectionCheck(autoWriteCheck, reject);
      const diffInDays = await getDiffInDays();
      if (diffInDays >= timeElapsed) {
        const octokit = new Octokit({
          auth: githubToken,
          baseUrl: apiBaseUrl
        });
        // GITHUB_REPOSITORY=gkr-bot/test-001
        const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
        // GITHUB_WORKFLOW_REF=gkr-bot/test-001/.github/workflows/blog-post-workflow.yml@refs/heads/main
        if (!workflowFile) workflowFile = process.env.GITHUB_WORKFLOW_REF.match(/\/([^\/]+)@/)[1];
        const response = await octokit.rest.actions.enableWorkflow({
          owner,
          repo,
          workflow_id: workflowFile,
        });
        response.status.toString() === '204' ? resolve('Kept repo active using the GitHUb API...') :
          reject(response);
      } else {
        resolve('Nothing to do...');
      }
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  KeepAliveWorkflow,
  APIKeepAliveWorkflow
};
