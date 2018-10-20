
/**
 * Generate Polly Voices and save them to S3.
 * @param {Object} options An object containing: awsRegion, bucketName, defaultVoice.
 * @returns {string} A URL of the saved MP3 file.
 */
const AlexaPolly = (options) => {
	const {
		awsRegion = 'us-east-1',
		bucketName = '',
		defaultVoice = 'Brian',
		returnAudioBuffer = false
	} = options;

	const AWS = require('aws-sdk');
	
	AWS.config.apiVersions = {
		polly: '2016-06-10',
	};
	
	const Polly = new AWS.Polly({
		region: awsRegion
	});
	
	const S3 = new AWS.S3({
		region: awsRegion
	});
	
	if (bucketName === '') {
		returnAudioBuffer = true;
	}
	
	this.say = async function (text, voiceId) {
		const url = await _textToSpeech(text, voiceId || defaultVoice);
		return url;
	}
	
	/* HELPER FUNCTIONS */
	
	/**
	* Simplifies Polly audio generation by auto-saving to S3 with built-in caching.
	* @param {string} text The text to render.
	* @param {string} voiceId The voice to use. Will default to defaultVoice if not specified.
	* @returns {string} a string containing the SSML audio tag with the URL of the generated voice.
	*/
	const _textToSpeech = async (text, voiceId) => {
		
		// generate a unique filename for that voice + text
		// so we can cache it if it is requested again. 
		// e.g. Kimberly-3ec60ad4a6716df783f92f627e11178c.mp3
		const filename = `${voiceId}-${_textToHash(text)}.mp3`;
		
		// Check if audio already exists in S3.
		const exists = await _isPollyAudioAlreadyGenerated(filename);
		
		if (exists && exists.url) {
			console.log('textToSpeech::LOG', 'File already existed.')
			return exists.url;
		}
		
		try {
			console.log('textToSpeech::LOG', 'File generated, as did not exist.')
			const audio = await _generatePollyAudio(text, voiceId)

			if(returnAudioBuffer) {
				return audio.AudioStream;
			} else {
				const data = await _writeAudioStreamToS3(audio.AudioStream, filename);
				url = data.url;
			}
		}
		catch (e) {
			throw e;
		}
		
		
		return url;
	}
	
	/**
	 * Synthesizes an input text into an AudioStream (Buffer).
	 * @param {string} text The text to synthesize
	 * @param {string} voiceId The voice to use. Will default to the defaultVoice
	 */
	const _generatePollyAudio = (text, voiceId) => {
		
		const params = {
			Text: text,
			OutputFormat: 'mp3',
			VoiceId: voiceId
		}
		
		return Polly.synthesizeSpeech(params).promise().then(audio => {
			if (audio.AudioStream instanceof Buffer) return audio
			else throw 'AudioStream is not a Buffer.'
		})
		
	}
	
	/**
	 * Saves audio data to S3
	 * @param {Buffer} audioStream The Polly-generated Audio Stream
	 * @param {string} filename The name to give the object in S3
	 * @returns {Object} Returns an object containing a success message, resource ETag and url.
	 */
	const _writeAudioStreamToS3 = (audioStream, filename) => _putObject(bucketName, filename, audioStream, 'audio/mp3').then(res => {
		if (!res.ETag) throw res
		else return {
			msg: 'File successfully generated.',
			ETag: res.ETag,
			url: `https://s3-${awsRegion}.amazonaws.com/${bucketName}/${filename}`
		}
	});
	
	/**
	 * Checks whether the requested text/voice combination has already been generated.
	 * @param {string} filename Will check if the file exists in the S3 bucket.
	 * @returns {string|bool} Will return the URL if it exists, or false;
	 */
	const _isPollyAudioAlreadyGenerated = async (filename) => {
		
		const params = {
			Bucket: bucketName,
			Key: filename
		};
		
		try {
			const headCode = await S3.headObject(params).promise();
			return {
				msg: 'Already generated.',
				ETag: headCode.ETag,
				url: `https://s3-${awsRegion}.amazonaws.com/${bucketName}/${filename}`
			}
		} catch (headErr) {
			return false;
		}
	}
	
	/**
	 * Saves content to an S3 bucket with specified filename (key)
	 * @param {string} bucket The name of the bucket
	 * @param {string} key The filename
	 * @param {Buffer} body The contents to save
	 * @param {string} ContentType The content type e.g. 'audio/mp3'
	 */
	const _putObject = (bucket, key, body, ContentType) => S3.putObject({
		Bucket: bucket,
		Key: key,
		Body: body,
		ContentType
	}).promise()
	
	/**
	* Generates a hash from the inputted text.
	* @param {string} text The text to hash
	* @returns {string} an md5 hash of the incoming text
	*/
	function _textToHash(text) {
		return require('crypto').createHash('md5').update(text).digest('hex');
	}

	return this;
	
}

module.exports = { AlexaPolly }