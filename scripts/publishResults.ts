import { readFileSync } from 'node:fs';

async function sendMessage(
  message: string,
  status: string,
  title: string,
  emoji = ':test_tube:',
): Promise<void> {
  const response = await fetch(
    `https://hooks.slack.com/services/${process.env.SLACK_WEBHOOK}`,
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
    throw new Error(
      `HTTP error! status: ${response.status}, body: ${errorText}`,
    );
  }
}

function createMessageTestResults(
  success: number,
  failure: number,
  testSuiteName: string,
) {
  const result = { status: '', message: '' };
  const totalTests = success + failure;
  const percent = (success / totalTests).toFixed(2);

  if (Number.parseFloat(percent) >= 0.98) {
    result.status = '#069C56';
  } else if (
    0.98 > Number.parseFloat(percent) &&
    Number.parseFloat(percent) > 0.7
  ) {
    result.status = '#FF681E';
  } else {
    result.status = '#D3212C';
  }

  result.message = `${testSuiteName}\n`;
  result.message += `Total tests ${totalTests}\n Pass ${success} / Fail ${failure}`;
  const reportUrl = `https://github.com/aave/aave-sdk/actions/runs/${process.env.GITHUB_RUN_ID || ''}/`;
  result.message += `\n <${reportUrl}|Link Github Pipeline>`;
  return result;
}

const main = async (): Promise<void> => {
  // Parse the test results
  const testResults = readFileSync('test-results.json', {
    encoding: 'utf8',
  });
  const testResultsJson = JSON.parse(testResults);
  const message = createMessageTestResults(
    testResultsJson.numPassedTests,
    testResultsJson.numFailedTests,
    'Aave SDK V3 - E2E Tests',
  );
  await sendMessage(message.message, message.status, 'Aave SDK V3 - E2E Tests');
};

main();
