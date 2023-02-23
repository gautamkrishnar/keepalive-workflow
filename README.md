# Keepalive Workflow [![npm version](https://badge.fury.io/js/keepalive-workflow.svg)](https://badge.fury.io/js/keepalive-workflow)
GitHub action to prevent GitHub from suspending your cronjob based triggers due to repository inactivity

### Why
GitHub will suspend the scheduled trigger for GitHub action workflows if there is no commit in the repository for the past 60 days. The cron based triggers won't run unless a new commit is made. It shows the message "This scheduled workflow is disabled because there hasn't been activity in this repository for at least 60 days" under the cronjob triggered action.

![preview](https://user-images.githubusercontent.com/8397274/105174930-4303e100-5b49-11eb-90ed-95a55697582f.png)

### What
This workflow will automatically create a dummy commit in your repo if the last commit in your repo is 50 days (default) ago.
This will keep the cronjob trigger active so that it will run indefinitely without getting suspended by GitHub for inactivity.

## How to use
There are two ways you can consume this library in your GitHub actions
### Via GitHub Actions (For GitHub Actions users)
You can just include the library as a step after one of your favorite GitHub actions. Your workflow file should have the checkout action defined in one of your steps since this library needs git CLI to work.

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
      - uses: actions/checkout@v3
      # - step1
      # - step 2
      # - step n, use it as the last step
      - uses: gautamkrishnar/keepalive-workflow@v1 # using the workflow with default settings
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
      - uses: actions/checkout@v3
      - uses: athul/waka-readme@master
        with:
          WAKATIME_API_KEY: ${{ secrets.WAKATIME_API_KEY }}
      - uses: gautamkrishnar/keepalive-workflow@v1 # using the workflow with default settings
```
</details>

### Via JavaScript library (For GitHub Actions developers)
For developers making awesome GitHub actions, you can consume the library in your javascript-based GitHub action by installing it from [NPM](https://www.npmjs.com/package/keepalive-workflow). Make sure that your GitHub action uses checkout action since this library needs it as a dependency.
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
const core = require('@actions/core');
const { KeepAliveWorkflow } = require('keepalive-workflow');

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
| `committer_email` | `gkr@tuta.io` | Email id used while committing to the repo | No |
| `time_elapsed` | `50` | Time elapsed from the previous commit to trigger a new automated commit (in days) | No |
| `auto_push` | `true` | Defines if the workflow pushes the changes automatically | No |

### For Javascript Library
If you are using the JS Library version of the project, please consult the function's DocString in [library.js](library.js) to see the list of available parameters.


### FAQs and Common issues
- [Error Code 128 / `GH006: Protected branch update failed`](https://github.com/gautamkrishnar/keepalive-workflow/discussions/13)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://github.com/abitmore"><img src="https://avatars.githubusercontent.com/u/9946777?v=4?s=100" width="100px;" alt="Abit"/><br /><sub><b>Abit</b></sub></a><br /><a href="https://github.com/gautamkrishnar/keepalive-workflow/commits?author=abitmore" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/Nigui"><img src="https://avatars.githubusercontent.com/u/6088236?v=4?s=100" width="100px;" alt="Guillaume NICOLAS"/><br /><sub><b>Guillaume NICOLAS</b></sub></a><br /><a href="https://github.com/gautamkrishnar/keepalive-workflow/commits?author=Nigui" title="Documentation">📖</a></td>
      <td align="center"><a href="https://github.com/dmaticzka"><img src="https://avatars.githubusercontent.com/u/113329?v=4?s=100" width="100px;" alt="Daniel Maticzka"/><br /><sub><b>Daniel Maticzka</b></sub></a><br /><a href="https://github.com/gautamkrishnar/keepalive-workflow/commits?author=dmaticzka" title="Code">💻</a></td>
      <td align="center"><a href="https://itrooz.fr"><img src="https://avatars.githubusercontent.com/u/42669835?v=4?s=100" width="100px;" alt="iTrooz"/><br /><sub><b>iTrooz</b></sub></a><br /><a href="https://github.com/gautamkrishnar/keepalive-workflow/commits?author=iTrooz" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License
This project uses [GNU GENERAL PUBLIC LICENSE](LICENSE)

## Liked it?

Hope you liked this project, don't forget to give it a star ⭐.
