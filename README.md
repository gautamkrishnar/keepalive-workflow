# Keepalive Workflow
GitHub action to prevent GitHub from suspending your cronjob based triggers due to repository inactivity

### Why ?
GitHub will suspend the scheduled trigger for GitHub action workflows if there is no commit in the repository for the past 60 days. The cron based triggers won't run unless a new commit is made.
![preview](https://user-images.githubusercontent.com/8397274/105174930-4303e100-5b49-11eb-90ed-95a55697582f.png)

### What ?
This workflow will automatically create a dummy commit in your repo if the last commit in your repo is 50 days (default) ago.
This will keep the cronjob trigger active, so that it will run indefinitely without getting suspended by GitHub for inactivity.
