const {KeepAliveWorkflow, APIKeepAliveWorkflow} = require('./library');
const core = require('@actions/core');

// Getting Config
const githubToken = core.getInput('gh_token');
const committerUsername = core.getInput('committer_username');
const committerEmail = core.getInput('committer_email');
const commitMessage = core.getInput('commit_message');
const autoPush = (core.getInput('auto_push') === 'true');
const timeElapsed = parseInt(core.getInput('time_elapsed'));
const autoWriteCheck = (core.getInput('auto_write_check') === 'true');
const useAPI = (core.getInput('use_api') === 'true');

if (useAPI) {
  // API Mode
  const workflowsList = [null, ...(core.getInput('workflow_files')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean))];
  const promiseArr = []
  workflowsList.forEach((workflowFile) => {
    promiseArr.push(new Promise(async (resolve, reject) => {
      const parentWorkflowPath = process.env.GITHUB_WORKFLOW_REF.match(/^(.*)@/)[1];
      core.info(`Executing keepalive for ${workflowFile ? workflowFile : `parent workflow (${parentWorkflowPath})`}`);
      APIKeepAliveWorkflow(githubToken, {
        autoWriteCheck,
        timeElapsed,
        workflowFile
      }).then((res) => resolve(res))
        .catch((err) => reject(err));
    }));
  });
  let exitFlag = 0;
  Promise.allSettled(promiseArr).then((results) => {
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        core.info(result.value);
      } else {
        core.error(result.value)
        exitFlag = 1;
      }
    })
  }).finally(() => {
    process.exit(exitFlag);
  });
} else {
  // Using the Git Mode
  KeepAliveWorkflow(githubToken, committerUsername, committerEmail, commitMessage, timeElapsed, autoPush, autoWriteCheck)
    .then((message) => {
      core.info(message);
      process.exit(0);
    })
    .catch((error) => {
      core.error(error);
      process.exit(1);
    });
}
