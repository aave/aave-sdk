import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { S3 } from '@aws-sdk/client-s3';

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

async function uploadReport(path?: string) {
  const s3Client = new S3({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN,
    },
  });
  const date = Date.now();
  const localPath = path || './reports/';
  const files = readdirSync(localPath);

  for (const file of files) {
    const localFilePath = join(localPath, file);
    const s3Key = `reports/${date}/${file}`;
    const stats = statSync(localFilePath);

    if (stats.isDirectory()) {
      await uploadReport(localFilePath);
    } else {
      let contentType = 'application/octet-stream';

      // Set content type based on file extension
      if (file.endsWith('.html')) {
        contentType = 'text/html';
      } else if (file.endsWith('.css')) {
        contentType = 'text/css';
      } else if (file.endsWith('.js')) {
        contentType = 'application/javascript';
      } else if (file.endsWith('.json')) {
        contentType = 'application/json';
      } else if (file.endsWith('.png')) {
        contentType = 'image/png';
      } else if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        contentType = 'image/jpeg';
      } else if (file.endsWith('.svg')) {
        contentType = 'image/svg+xml';
      } else if (file.endsWith('.webp')) {
        contentType = 'image/webp';
      }

      try {
        const data =
          typeof localFilePath === 'string'
            ? readFileSync(localFilePath)
            : localFilePath;
        await s3Client.putObject({
          Bucket: 'assets.aave.com',
          Body: data,
          Key: s3Key,
          ContentType: contentType,
          CacheControl: 'no-cache, no-store, must-revalidate',
          Expires: new Date(Date.now() - 1), // Set expiration to the past
        });
        console.log(`Uploaded: ${s3Key}`);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        throw new Error(
          `Error uploading file ${typeof localFilePath === 'string' ? localFilePath : 'buffer'} to S3: ${errorMessage}`,
        );
      }
    }
  }
}

const main = async (): Promise<void> => {
  // Parse the test results
  const testResults = readFileSync('reports/test-results.json', {
    encoding: 'utf8',
  });
  const testResultsJson = JSON.parse(testResults);
  const message = createMessageTestResults(
    testResultsJson.numPassedTests,
    testResultsJson.numFailedTests,
    'Aave SDK V3 - E2E Tests',
  );
  // await sendMessage(message.message, message.status, 'Aave SDK V3 - E2E Tests');
  await uploadReport();
};

main();
