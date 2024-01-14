const {KeepAliveWorkflow} = require('./library');
const core = require('@actions/core');

// Getting Config
const githubToken = core.getInput('gh_token');
const committerUsername = core.getInput('committer_username');
const committerEmail = core.getInput('committer_email');
const commitMessage = core.getInput('commit_message');
const autoPush = (core.getInput('auto_push') === 'true');
const timeElapsed = parseInt(core.getInput('time_elapsed'));
const autoWriteCheck = (core.getInput('auto_write_check') === 'true');

// Using the lib
KeepAliveWorkflow(githubToken, committerUsername, committerEmail, commitMessage, timeElapsed, autoPush, autoWriteCheck)
  .then((message) => {
    core.info(message);
    process.exit(0);
  })
  .catch((error) => {
    core.error(error);
    process.exit(1);
  });
