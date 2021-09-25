# Keepalive Workflow
GitHub action to prevent GitHub from suspending your cronjob based triggers due to repository inactivity

### Why
GitHub will suspend the scheduled trigger for GitHub action workflows if there is no commit in the repository for the past 60 days. The cron based triggers won't run unless a new commit is made.
![preview](https://user-images.githubusercontent.com/8397274/105174930-4303e100-5b49-11eb-90ed-95a55697582f.png)

### What
This workflow will automatically create a dummy commit in your repo if the last commit in your repo is 50 days (default) ago.
This will keep the cronjob trigger active so that it will run indefinitely without getting suspended by GitHub for inactivity.

## How to use
There are two ways you can consume this library in your GitHub actions
### Via GitHub Actions (For GitHub actions users)
You can just include the library as a step after one of your favorite GitHub actions.
```yaml
name: Github Action with a cronjob trigger
on:
  schedule:
    - cron: "0 0 * * *"

jobs:
  cronjob-based-github-action:
    name: Cronjob based github action
    runs-on: ubuntu-latest
    steps:
      - # step1
      - # step 2
      - # step n, use it as the last step
      - uses: gautamkrishnar/keepalive-workflow@master # using the workflow with default settings
```
<details>
  <summary>Let's take an example of [Waka Readme](https://github.com/athul/waka-readme)</summary>

```yaml
name: My awesome readme
on:
  workflow_dispatch:
  schedule:
    # Runs at 12 am UTC
    - cron: "0 0 * * *"

jobs:
  update-readme:
    name: Update this repo's README
    runs-on: ubuntu-latest
    steps:
      - uses: athul/waka-readme@master
        with:
          WAKATIME_API_KEY: ${{ secrets.WAKATIME_API_KEY }}
      - uses: gautamkrishnar/keepalive-workflow@master # using the workflow with default settings
```
</details>

### Via JavaScript library (For GitHub Actions developers)
For developers making awesome GitHub actions, you can consume the library in your javascript-based GitHub action by installing it from [NPM](https://www.npmjs.com/package/keepalive-workflow).
You can also ask your users to include it as an additional step as mentioned in the first part.

#### Install the package
Install via NPM:
```bash
npm i keepalive-workflow
```

Install via Yarn:
```bash
yarn add keepalive-workflow
```

#### Use it in your own GitHub action source code
```javascript
const { KeepAliveWorkflow } = require('keepalive-workflow')

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
```

## Options
### For GitHub Action
If you use the workflow as mentioned via GitHub actions following are the options available to you to customize its behavior.

| Option | Default Value | Description | Required |
|--------|--------|--------|--------|
| `gh_token` | your default GitHub token with repo scope | GitHub access token with Repo scope | No |
| `commit_message` | `Automated commit by Keepalive Workflow to keep the repository active` | Commit message used while committing to the repo | No  |
| `committer_username` | `gkr-bot` | Username used while committing to the repo | No |
| `committer_username` | `gkr@tuta.io` | Email id used while committing to the repo | No |
| `time_elapsed` | `50` | Time elapsed from the previous commit to trigger a new automated commit (in days) | No |

### For Javascript Library
If you are using the JS Library version of the project, please consult the function's DocString in [library.js](library.js) to see the list of available parameters.

## License
This project uses [GNU GENERAL PUBLIC LICENSE](LICENSE)

## Liked it?

Hope you liked this project, don't forget to give it a star ⭐.
