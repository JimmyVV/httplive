import Log from 'lib/log';

const log = new Log('AACDemux');

export default class AACDemux {
	constructor({
		audioTrack,
		mediaInfo
	}) {
		this._audioTrack = audioTrack;
		this._mediaInfo = mediaInfo;

		this._mpegSamplingRates = [
			96000,
			88200,
			64000,
			48000,
			44100,
			32000,
			24000,
			22050,
			16000,
			12000,
			11025,
			8000,
			7350
		];

	}
	parse(chunk,timeStamp) {
		let v = new DataView(chunk);

		let type = v.getUint8(0);

		if (type === 0) {
			this._parseConfig(chunk.slice(1));
		} else {
			this._parseAAC(chunk.slice(1),timeStamp);
		}
	}
	// chunk is SoundData in flv audio tag
	_parseAAC(chunk,timeStamp) {
		let audio = new Uint8Array(chunk);

		this._audioTrack.samples.push({
			unit:audio,
			length:audio.byteLength,
			timeStamp
		});

		this._audioTrack.length += audio.byteLength;

	}
	_parseConfig(chunk) {
		let audio = new Uint8Array(chunk),
			meta = this._audioTrack.meta,
			config,
			userAgent = navigator
			.userAgent
			.toLowerCase();

		let audioObjectType = audio[0] >>> 3; // 5b
		let originType = audioObjectType;
		let samplingFreIndex = ((audio[0] & 0x07) << 1) | (audio[1] >>> 7); // 4b
		let extensionSamplingIndex = null;

		// only decode the sample frequenct between 0 - 13.
		if (samplingFreIndex < 0 || samplingFreIndex >= this._mpegSamplingRates.length) {
			log.e('invalid samplingFreIndex: ' + samplingFreIndex);
			return;
		}


		let samplingFre = this._mpegSamplingRates[samplingFreIndex];

		let channelConfig = (audio[1] & 0x78) >>> 3;
		if (channelConfig < 0 || channelConfig > 7) {
			log.e('invalid channel Count: ' + channelConfig);
			return;
		}

		if (audioObjectType === 5) { // HE-AAC/SBR
			// 4 bits
			extensionSamplingIndex = ((audio[1] & 0x07) << 1) | (audio[2] >>> 7);
			// 5 bits
			audioExtensionObjectType = (audio[2] & 0x7C) >>> 2;
		}

		// refer adts.js in hls.js
		// https://github.com/video-dev/hls.js/blob/master/src/demux/adts.js

		log.i(`userAgent is ${userAgent}`);

		log.i(`the audioObjectType in AAC is ${audioObjectType}`);

		// firefox: freq less than 24kHz = AAC SBR (HE-AAC)
		if (userAgent.indexOf('firefox') !== -1) {
			if (samplingFreIndex >= 6) {
				audioObjectType = 5;
				config = new Array(4);

				// HE-AAC uses SBR (Spectral Band Replication) , high frequencies are
				// constructed from low frequencies so there is a factor 2 between sample fre
				// rate and exten fre rate and refering to _mpegSamplingRates list mutiply the
				// sample rate by 2, which is equivalent to substract 3 from samplingFreIndex
				extensionSamplingIndex = samplingFreIndex - 3;
			} else { // use LC-AAC
				audioObjectType = 2;
				config = new Array(2);
				extensionSamplingIndex = samplingFreIndex;
			}
		} else if (userAgent.indexOf('android') !== -1) {
			// Android: use LC-AAC
			audioObjectType = 2;
			config = new Array(2);
			extensionSamplingIndex = samplingFreIndex;
		} else {
			// other browsers always use HE-AAC SBR type they don't support codec switch

			audioObjectType = 5;
			extensionSamplingIndex = samplingFreIndex;
			config = new Array(4);

			if (samplingFreIndex >= 6) {
				extensionSamplingIndex = samplingFreIndex - 3;
			} else if (channelConfig === 1) { // Mono channel
				audioObjectType = 2;
				config = new Array(2);
				extensionSamplingIndex = samplingFreIndex;
			}

			config[0] = audioObjectType << 3;
			config[0] |= (samplingFreIndex & 0x0F) >>> 1;
			config[1] = (samplingFreIndex & 0x0F) << 7;
			config[1] |= (channelConfig & 0x0F) << 3;

		}

		config[0] = audioObjectType << 3;
		config[0] |= (samplingFreIndex & 0x0F) >>> 1;
		config[1] = (samplingFreIndex & 0x0F) << 7;
		config[1] |= (channelConfig & 0x0F) << 3;
		if (audioObjectType === 5) {
			// audioObjectType (force to 2, chrome is checking that object type is less than
			// 5 ???
			// https://chromium.googlesource.com/chromium/src.git/+/master/media/formats/mp4
			//
			config[1] |= ((extensionSamplingIndex & 0x0F) >>> 1);
			config[2] = (extensionSamplingIndex & 0x01) << 7;
			// extended audio object type: force to 2 (LC-AAC)
			config[2] |= (2 << 2);
			config[3] = 0;
		}

		meta.config = config;
		meta.audioSampleRate = samplingFre;
		meta.channelCount = channelConfig;
		meta.codec = 'mp4a.40.' + audioObjectType;

		// meta.refSampleDuration = Math.floor(1024 / meta.audioSampleRate * meta.timescale);
		// stupid Math.floor
		meta.refSampleDuration = 1024 / meta.audioSampleRate * meta.timescale;

		console.log(meta.refSampleDuration);

	}
}