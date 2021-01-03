const core = require('@actions/core');
const github = require('@actions/github');

try {
  const ogaNo = core.getInput('oga-no');
  console.log(`want${ogaNo}`);
  const time = (new Date()).toTimeString();
  core.setOutput("boat", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
