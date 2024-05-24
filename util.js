const {spawn} = require('child_process');

/**
 * Executes a command and returns its result as promise
 * @param cmd {string} - command to execute
 * @param args {array} - command line args
 * @param options {Object} - extra options
 * @return {Promise<Object>}
 */
const execute = (cmd, args = [], options = {}) => new Promise((resolve, reject) => {
  let outputData = '';
  let errorData = '';
  const optionsToCLI = {
    ...options
  };
  if (!optionsToCLI.stdio) {
    Object.assign(optionsToCLI, {stdio: ['pipe', 'pipe', 'pipe']});
  }
  const app = spawn(cmd, args, optionsToCLI);
  if (app.stdout) {
    // Only needed for pipes
    app.stdout.on('data', function (data) {
      outputData += data.toString();
    });
  }

  // show command errors
  if (app.stderr) {
    app.stderr.on('data', function (data) {
      errorData += data.toString();
    });
  }

  app.on('close', (code) => {
    const responseObj = {command: cmd+" "+args.join(" "), exitCode: code, outputData, errorData};
    if (code !== 0) {
      return reject(responseObj);
    }
    return resolve(responseObj);
  });
});

/**
 * Get last number of days elapsed from last commit
 * @async
 * @return {Promise<number>}
 */
const getDiffInDays = async () => {
  const {outputData} = await execute('git', ['--no-pager', 'log', '-1', '--format=%ct'],
    {encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']});

  const commitDate = new Date(parseInt(outputData, 10) * 1000);
  return Math.round((new Date() - commitDate) / (1000 * 60 * 60 * 24));
}

/**
 * Automatic write check
 * @param {boolean} autoWriteCheck
 * @param {function(string): void} cbReject failure callback
 * @param {function(string): void} cbResolve success callback
 */
const writeDetectionCheck = (autoWriteCheck, cbReject, cbResolve) => {
  if (autoWriteCheck) {
    // Protected branches
    if (process.env.GITHUB_REF_PROTECTED === 'true') {
      cbReject(`Looks like the branch is write protected. You need to disable that for this to work: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches`)
    }
    // Pull request check - Do nothing
    if (process.env.GITHUB_EVENT_NAME === 'pull_request' || process.env.GITHUB_EVENT_NAME === 'pull_request_target') {
      cbResolve('Looks like this is triggered via a pull request. Doing Nothing...');
    }
  }
}

module.exports = {
  execute,
  getDiffInDays,
  writeDetectionCheck
};
