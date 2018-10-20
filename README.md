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

//Inside a lambda context
exports.handler = async (event) => {
	const { AlexaPolly } = require('alexa-polly');

	const polly = AlexaPolly({
		awsRegion: 'eu-west-1',          // <-- your AWS region
		bucketName: 'your-bucket-name',  // <-- your AWS bucket name
		defaultVoice: 'Brian'            // <-- the unique id of the Polly voice you wish to use
	});

	await polly.say('Hello world');
  // -> https://s3-eu-west-1.amazonaws.com/your-bucket-name/Brian-feb8c74fc13ec529e245d16227c26a79.mp3

  await polly.say('Hello world in a different voice', 'Kimberly');
  // -> https://s3-eu-west-1.amazonaws.com/your-bucket-name/Kimberly-e245d16227c26a79feb8c74fc13ec529.mp3
}; 
```