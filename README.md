# Who is this for

This is the module for you if you want to:
- Use Amazon Polly via Lambda
- Cache the responses in S3 and serve them via S3

# How to use

Make sure your AWS Lambda function has permissions to access:
- your S3 bucket
- Polly


# Usage

```javascript
const { AlexaPolly } = require('alexa-polly');

const polly = new AlexaPolly({
  awsRegion: 'eu-west-1',
  bucketName: 'your-bucket-name',
  defaultVoice: 'Brian'
});

async function() {
	const speech = await polly.say('Hello world'); // https://s3-eu-west-1.amazonaws.com/your-bucket-name/Brian-feb8c74fc13ec529e245d16227c26a79.mp3
}
```