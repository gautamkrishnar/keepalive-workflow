const {spawn} = require('child_process');

/**
 * @description Executes a command and returns its result as promise
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

module.exports = {
  execute
};
