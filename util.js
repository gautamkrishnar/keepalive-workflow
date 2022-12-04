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
  const optionsToCLI = {
    ...options
  };
  if (!optionsToCLI.stdio) {
    Object.assign(optionsToCLI, {stdio: ['inherit', 'inherit', 'inherit']});
  }
  const app = spawn(cmd, args, optionsToCLI);
  if (app.stdout) {
    // Only needed for pipes
    app.stdout.on('data', function (data) {
      outputData += data.toString();
    });
  }

  app.on('close', (code) => {
    if (code !== 0) {
      return reject({code, outputData});
    }
    return resolve({code, outputData});
  });
  app.on('error', (error) => reject({code: 1, outputData, error}));
});

module.exports = {
  execute
};
