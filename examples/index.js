const { AlexaPolly } = require('alexa-polly');

const polly = new AlexaPolly({
  awsRegion: 'eu-west-1',
  bucketName: 'your-bucket-name',
  defaultVoice: 'Brian'
});

polly.say('Hello world'); // https://s3-eu-west-1.amazonaws.com/your-bucket-name/Brian-feb8c74fc13ec529e245d16227c26a79.mp3