const {KeepAliveWorkflow} = require('./library');
const core = require('@actions/core');

// Getting Config
const githubToken = core.getInput('gh_token');
const committerUsername = core.getInput('committer_username');
const committerEmail = core.getInput('committer_email');
const commitMessage = core.getInput('commit_message');
const timeElapsed = parseInt(core.getInput('time_elapsed'));

// Using the lib
KeepAliveWorkflow(githubToken, committerUsername, committerEmail, commitMessage, timeElapsed)
  .then((message) => {
    core.info(message);
    process.exit(0);
  })
  .catch((error) => {
    core.error(error);
    process.exit(1);
  });
