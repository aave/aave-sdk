import { readFileSync } from 'fs';

async function sendMessage(message, status, title, emoji = ':test_tube:') {
  console.log(message, status, title, emoji);
  const response = await fetch(
    'https://hooks.slack.com/services/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', // ${process.env.SLACK_WEBHOOK_URL}
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: title,
        icon_emoji: emoji,
        attachments: [{ color: status, text: message }],
      }),
    },
  );
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Response status:', response.status);
    console.error('Response body:', errorText);
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }
}

function createMessageTestResults(
  success,
  failure,
  totalTime,
  testSuiteName,
) {
  const result = { status: '', message: '' };
  const totalTests = success + failure;
  const percent = (success / totalTests).toFixed(2);
  if (Number.parseFloat(percent) >= 0.99) {
    result.status = '#069C56';
  } else if (
    0.99 > Number.parseFloat(percent) &&
    Number.parseFloat(percent) > 0.7
  ) {
    result.status = '#FF681E';
  } else {
    result.status = '#D3212C';
  }
  result.message = `${testSuiteName}\n`;
  result.message += `Total tests ${totalTests}\n Pass ${success} / Fail ${failure} / Duration ${(
    totalTime / 60.0
  ).toFixed(2)} minutes`;
  const reportUrl = `https://github.com/aave/aave-sdk/actions/runs/${process.env.GITHUB_RUN_ID || ''}/`;
  result.message += `\n <${reportUrl}|Link Github Pipeline>`;
  return result;
}

const main = async () => {
  // Parse the test results
  const testResults = readFileSync('test-results.json', {
    encoding: 'utf8',
  });
  const testResultsJson = JSON.parse(testResults);
  const message = createMessageTestResults(
    testResultsJson.numPassedTests,
    testResultsJson.numFailedTests,
    testResultsJson.numTotalTests,
    'Aave SDK V3 - E2E Tests',
  );
  await sendMessage(message.message, message.status, 'Aave SDK V3 - E2E Tests');
};

main();
