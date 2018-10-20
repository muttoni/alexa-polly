

exports.handler = async (event) => {
	const { AlexaPolly } = require('alexa-polly');

	const polly = AlexaPolly({
		awsRegion: 'eu-west-1',
		bucketName: 'your-bucket-name',
		defaultVoice: 'Brian'
	});

	await polly.say('Hello world'); // https://s3-eu-west-1.amazonaws.com/your-bucket-name/Brian-feb8c74fc13ec529e245d16227c26a79.mp3
	await polly.say('Hello world', 'Emma'); // https://s3-eu-west-1.amazonaws.com/your-bucket-name/Emma-ec529e245d16227c26a79feb8c74fc13.mp3
}; 