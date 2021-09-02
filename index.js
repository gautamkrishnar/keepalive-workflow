const core = require('@actions/core');
const {execute} = require('util');

/**
 * Keep Alive Workflow
 * @type {Promise<string>}
 */
const KeepAliveWorkflow = new Promise(async (resolve, reject) => {
  try {
    // Getting config
    const githubToken = core.getInput('gh_token');
    const committerUsername = core.getInput('committer_username');
    const committerEmail = core.getInput('committer_email');
    const commitMessage = core.getInput('commit_message');
    const timeElapsed = parseInt(core.getInput('time_elapsed'));

    // Calculating the last commit date
    const {outputData} = await execute('git', ['--no-pager', 'log', '-1', '--format=%ct'],
      {encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']});

    const commitDate = new Date(parseInt(outputData, 10) * 1000);
    const diffInDays = Math.round((new Date() - commitDate) / (1000 * 60 * 60 * 24));

    if (diffInDays > timeElapsed) {
      // Do dummy commit if elapsed time is greater than 50 (default) days
      core.info('Doing dummy commit to keep repository active');
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
        `https://${githubToken}@github.com/${process.env.GITHUB_REPOSITORY}.git`
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
        `"${commitMessage}"`]);
      resolve('Dummy commit created...');
    } else {
      resolve('Nothing to do');
    }
  } catch (e) {
    reject(e.toString());
  }
});

KeepAliveWorkflow
  .then((message) => {
    core.info(message);
    process.exit(1);
  })
  .catch((error) => {
    core.error(error);
    process.exit(1);
  });
