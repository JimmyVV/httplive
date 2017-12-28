let MP4 = {};

MP4.types = {
	// codingname
	avc1: [],
	avcC: [],
	btrt: [],
	dinf: [],
	dref: [],
	esds: [],
	ftyp: [],
	hdlr: [],
	mdat: [],
	mdhd: [],
	mdia: [],
	mfhd: [],
	minf: [],
	moof: [],
	moov: [],
	mp4a: [],
	'.mp3': [],
	mvex: [],
	mvhd: [],
	pasp: [],
	sdtp: [],
	stbl: [],
	stco: [],
	stsc: [],
	stsd: [],
	stsz: [],
	stts: [],
	tfdt: [],
	tfhd: [],
	traf: [],
	trak: [],
	trun: [],
	trex: [],
	tkhd: [],
	vmhd: [],
	smhd: [],
	free: [],
	stss: [],
	ctts: []
}


MP4.symbolValue = {
	FTYP: new Uint8Array([
		0x69, 0x73, 0x6F, 0x6D, // major_brand: isom
		0x0, 0x0, 0x0, 0x1, // minor_version: 0x01
		0x69, 0x73, 0x6F, 0x6D, // isom
		0x61, 0x76, 0x63, 0x31 // avc1
	]),
	HDLR_VIDEO: new Uint8Array([
		0x00, 0x00, 0x00, 0x00, // version(0) + flags
		0x00, 0x00, 0x00, 0x00, // pre_defined
		0x76, 0x69, 0x64, 0x65, // handler_type: 'vide'
		0x00, 0x00, 0x00, 0x00, // reserved: 3 * 4 bytes
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
		0x56, 0x69, 0x64, 0x65,
		0x6F, 0x48, 0x61, 0x6E,
		0x64, 0x6C, 0x65, 0x72, 0x00 // name: VideoHandler
	]),
	HDLR_AUDIO: new Uint8Array([
		0x00, 0x00, 0x00, 0x00, // version(0) + flags
		0x00, 0x00, 0x00, 0x00, // pre_defined
		0x73, 0x6F, 0x75, 0x6E, // handler_type: 'soun'
		0x00, 0x00, 0x00, 0x00, // reserved: 3 * 4 bytes
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
		0x53, 0x6F, 0x75, 0x6E,
		0x64, 0x48, 0x61, 0x6E,
		0x64, 0x6C, 0x65, 0x72, 0x00 // name: SoundHandler
	]),
	STSC: new Uint8Array([
		0x00, 0x00, 0x00, 0x00, // version(0) + flags
		0x00, 0x00, 0x00, 0x01, // entry_count
		0x00, 0x00, 0x00, 0x01,
		0x00, 0x00, 0x00, 0x01,
		0x00, 0x00, 0x00, 0x01
	]),
	FSTTS: new Uint8Array([
		0x00, 0x00, 0x00, 0x00, // version(0) + flags
		0x00, 0x00, 0x00, 0x00 // entry_count
	]),
	FSTSC: new Uint8Array([
		0x00, 0x00, 0x00, 0x00, // version(0) + flags
		0x00, 0x00, 0x00, 0x00 // entry_count
	]),
	FSTSZ: new Uint8Array([
		0x00, 0x00, 0x00, 0x00, // version(0) + flags
		0x00, 0x00, 0x00, 0x00, // sample_size
		0x00, 0x00, 0x00, 0x00 // sample_count
	]),
	FSTCO: new Uint8Array([
		0x00, 0x00, 0x00, 0x00, // version(0) + flags
		0x00, 0x00, 0x00, 0x00 // entry_count
	]),
	STTS: new Uint8Array([
		0x00, 0x00, 0x00, 0x00 // version(0) + flags
	]),
	CTTS: new Uint8Array([
		0x00, 0x00, 0x00, 0x00 // version(0) + flags
	]),
	STCO: new Uint8Array([
		0x00, 0x00, 0x00, 0x00 // version(0) + flags
	]),
	STSZ: new Uint8Array([
		0x00, 0x00, 0x00, 0x00 // version(0) + flags
	]),
	STSD: new Uint8Array([
		0x00, 0x00, 0x00, 0x00, // version(0) + flags
		0x00, 0x00, 0x00, 0x01 // entry_count
	]),
	DREF: new Uint8Array([
		0x00, 0x00, 0x00, 0x00, // version(0) + flags
		0x00, 0x00, 0x00, 0x01, // entry_count
		0x00, 0x00, 0x00, 0x0C, // entry_size
		0x75, 0x72, 0x6C, 0x20, // type 'url '
		0x00, 0x00, 0x00, 0x01 // version(0) + flags
	]),
	VMHD: new Uint8Array([
		0x00, 0x00, 0x00, 0x01, // version(0) + flags
		0x00, 0x00, // graphicsmode: 2 bytes
		0x00, 0x00, 0x00, 0x00, // opcolor: 3 * 2 bytes
		0x00, 0x00
	]),
	SMHD: new Uint8Array([
		0x00, 0x00, 0x00, 0x00, // version(0) + flags
		0x00, 0x00, 0x00, 0x00 // balance(2) + reserved(2)
	]),
	STSS: new Uint8Array([
		0x00, 0x00, 0x00, 0x00 // version(0) + flags
	])
}

/**
 * @param type {MP4.types} one of MP4.types
 * @param buffers {Array} the body buffer of box.
 * @return buffer {TypeArray} the complete box buffer.
 */
MP4.box = function (type) {
	let boxLength = 8; // include the total 8 byte length of size and type

	let buffers = Array.prototype.slice.call(arguments, 1);

	buffers.forEach(val => {
		boxLength += val.byteLength;
	});

	let boxBuffer = new Uint8Array(boxLength);
	// the first four byte stands for boxLength
	boxBuffer[0] = (boxLength >> 24) & 0xff;
	boxBuffer[1] = (boxLength >> 16) & 0xff;
	boxBuffer[2] = (boxLength >> 8) & 0xff;
	boxBuffer[3] = boxLength & 0xff;

	// the second four byte is box's type
	boxBuffer.set(type, 4);

	let offset = 8; // the byteLength of type and size

	buffers.forEach(val => {
		boxBuffer.set(val, offset);
		offset += val.byteLength;
	})

	return boxBuffer;

}

MP4.free = function () {
	return MP4.box(MP4.types.free);
}

MP4.moof = function (track, baseDTS,seq) {
	return MP4.box(MP4.types.moof, // whole box
		MP4.mfhd(seq), // mfhd box
		MP4.traf(track, baseDTS) // the subset box
	);
}

// it is a fullBox not box!
MP4.mfhd = function (seq) {
	return MP4.fragmentBox(MP4.types.mfhd, seq);
}

MP4.mdat = function (length) {
	length += 8;
	let mdat = new Uint8Array(length);

	let view = new DataView(mdat.buffer);

	view.setUint32(0, length);
	mdat.set(MP4.types.mdat, 4);

	return mdat;
}

MP4.traf = function (track, baseDTS) {

	// track fragment header
	let tfhd = MP4.tfhd(track.id);

	// track fragment Decode Time
	let tfdt = MP4.tfdt(baseDTS);

	// SampleDependencyTypeBox
	let sdtp = MP4.sdtp(track);

	// TrackRunBox
	// the second param is data_offset. it is the value from moof to mdat ,which
	// doesn't include trun as it is calculated in MP4.trun func
	// more information from https://github.com/video-dev/hls.js/commit/a4d91f1563799787472f4edd1ffc8233a7deda4c#diff-5370391fc0f63f30e8498af38d9c443fR552
	let trun = MP4.trun(track,
		8 + // moof
		16 + // mfhd
		8 + // traf
		16 + // tfhd
		16 + // tfdt
		//trun  in the function to add trun.length
		sdtp.byteLength + // sdtp length
		8 //mdat
	);


	return MP4.box(MP4.types.traf, tfhd, tfdt, trun, sdtp);

}

// TrackRunBox
MP4.trun = function (track, offset) {
	let samples = track.samples || [],
		sampleCount = samples.length,
		bufferLength = 12 + 16 * sampleCount, // 12: 3 * 32bit. 16: 4 * 32bit
		buffer = new Uint8Array(bufferLength);

	offset += 8 + bufferLength; // 8: type + size

	// not include first_sample_flags
	buffer.set([
		0x00, // version
		0x00,
		0x0F,
		0x01, // flags:the total sum of listed flags in mp4
		(sampleCount >>> 24) & 0xFF, // sample_count
		(sampleCount >>> 16) & 0xFF,
		(sampleCount >>> 8) & 0xFF,
		(sampleCount) & 0xFF,
		(offset >>> 24) & 0xFF, // data_offset
		(offset >>> 16) & 0xFF,
		(offset >>> 8) & 0xFF,
		(offset) & 0xFF
	], 0);

	samples.forEach((sample, index) => {
		let {
			duration,
			sampleSize,
			flags,
			cts
		} = sample;

		buffer.set([
			(duration >>> 24) & 0xFF, // sample_duration
			(duration >>> 16) & 0xFF,
			(duration >>> 8) & 0xFF,
			(duration) & 0xFF,
			(sampleSize >>> 24) & 0xFF, // sample_size
			(sampleSize >>> 16) & 0xFF,
			(sampleSize >>> 8) & 0xFF,
			(sampleSize) & 0xFF,
			(flags.isLeading << 2) | flags.dependsOn, // sample_flags
			(flags.isDepended << 6) | (flags.hasRedundancy << 4) | flags.isNonSync,
			0x00,
			0x00, // sample_degradation_priority
			(cts >>> 24) & 0xFF, // sample_composition_time_offset
			(cts >>> 16) & 0xFF,
			(cts >>> 8) & 0xFF,
			(cts) & 0xFF
		], 12 + 16 * index);
	});
	return MP4.box(MP4.types.trun, buffer);
}

/**
 * @name SampleDependencyTypeBox
 * @desc extends fullbox and save some values about dependency flags
 *      like reserved{always 0} sample_depends_on sample_is_depended_on
 * @return fullbox + 8 * sample_count
 */
MP4.sdtp = function (track) {
	let samples = track.samples || [],
		length = samples.length,
		buffer = new Uint8Array(length + 4);

	for (let i = 0, flags; i < length; i++) {
		flags = samples[i].flags;
		// skip 4B version && type which are always 0x00
		buffer[i + 4] = (flags.dependsOn << 4) | (flags.isDepended << 2) | (flags.hasRedundancy)
		// skip 2bit reserved flag which default value is 0b00;
	}
	return MP4.box(MP4.types.sdtp, buffer);

}

MP4.tfhd = function (trackId) {
	return MP4.fragmentBox(MP4.types.tfhd, trackId);
}

MP4.tfdt = function (baseDTS) {
	return MP4.fragmentBox(MP4.types.tfdt, baseDTS);
}

MP4.fragmentBox = function (type, param) {
	let buffer = new Uint8Array([
		0x00, 0x00, 0x00, // flgs
		0x00, // version
		(param >>> 24) & 0xFF, // track_ID
		(param >>> 16) & 0xFF,
		(param >>> 8) & 0xFF,
		(param) & 0xFF
	]);
	return MP4.box(type, buffer);
}

MP4.ftyp = function () {
	return MP4.box(MP4.types.ftyp, MP4.symbolValue.FTYP);
}

MP4.initBox = function (meta1,meta2) {
	let ftyp = MP4.box(MP4.types.ftyp, MP4.symbolValue.FTYP),
		moov = MP4.fmoov(meta1,meta2);

	let buffer = new Uint8Array(ftyp.byteLength + moov.byteLength);

	buffer.set(ftyp, 0);
	buffer.set(moov, ftyp.byteLength);
	return buffer;
}

MP4.fmoov = function (meta1,meta2) {
	let mvhd = MP4.mvhd(meta1.timescale, meta1.duration);
	if(meta2){
		return MP4.box(MP4.types.moov,mvhd,MP4.trak(meta1),MP4.trak(meta2), MP4.mvex(1,2))
	}

	return MP4.box(MP4.types.moov,mvhd,MP4.trak(meta1), MP4.mvex(1))


	// return MP4.box(MP4.types.moov, mvhd, trak, mvex);
}


// TODO
MP4.moov = function (mvhd, trak, mvex) {
	return MP4.box(MP4.types.moov, mvhd, trak);
	// return MP4.box(MP4.types.moov, mvhd, videoTrak, audioTrak);
}

MP4.mvex = function (id1,id2) {
	if(id2){
		return MP4.box(MP4.types.mvex, MP4.trex(id1),MP4.trex(id2));	
	}
	return MP4.box(MP4.types.mvex, MP4.trex(id1));
}

MP4.trex = function (trackId) {
	let buffer = new Uint8Array([
		0x00, 0x00, 0x00, 0x00, // version(0) + flags
		(trackId >>> 24) & 0xFF, // track_ID
		(trackId >>> 16) & 0xFF,
		(trackId >>> 8) & 0xFF,
		(trackId) & 0xFF,
		0x00, 0x00, 0x00, 0x01, // default_sample_description_index
		0x00, 0x00, 0x00, 0x00, // default_sample_duration
		0x00, 0x00, 0x00, 0x00, // default_sample_size
		0x00, 0x01, 0x00, 0x01 // default_sample_flags
	]);
	return MP4.box(MP4.types.trex, buffer);
}



MP4.trak = function (meta) {
	return MP4.box(MP4.types.trak, MP4.tkhd(meta), MP4.mdia(meta));
}

MP4.mdia = function (meta) {
	return MP4.box(MP4.types.mdia, MP4.mdhd(meta), MP4.hdlr(meta), MP4.minf(meta));
}

// declares media type
MP4.hdlr = function (meta) {
	return meta.type === 'video' ?
		MP4.box(MP4.types.hdlr, MP4.symbolValue.HDLR_VIDEO) :
		MP4.box(MP4.types.hdlr, MP4.symbolValue.HDLR_AUDIO);
}

MP4.minf = function (meta) {
	let type_mdh = meta.type === 'video' ?
		MP4.box(MP4.types.vmhd, MP4.symbolValue.VMHD) :
		MP4.box(MP4.types.smhd, MP4.symbolValue.SMHD);

	// TODO you can replace fstbl as stbl when you want to produce standard mp4 not fragmented mp4
	return MP4.box(MP4.types.minf, type_mdh, MP4.dinf(), MP4.fstbl(meta));

}

MP4.dinf = function () {
	let dref = MP4.box(MP4.types.dref, MP4.symbolValue.DREF);

	return MP4.box(MP4.types.dinf, dref);
}

MP4.stss = function (meta) {
	let {
		track
	} = meta;

	let samples = track.samples;

	let keyframes = [];


	samples.forEach(({
		keyframe
	}, index) => {
		if (keyframe) keyframes.push(index);
	})

	let stssBuffer = new DataView(new ArrayBuffer(4 + keyframes.length * 4));

	stssBuffer.setUint32(0, keyframes.length);

	let offset = 4;
	keyframes.forEach(val => {
		stssBuffer.setUint32(offset, val + 1);
		offset += 4;
	})

	return MP4.box(MP4.types.stss, MP4.symbolValue.STSS, new Uint8Array(stssBuffer.buffer));
}

// so important
// sample table box
// TODO: separate the audio trak and the video trak
MP4.stbl = function (meta) {
	if (meta.type === 'audio') {
		return MP4.box(MP4.types.stbl, MP4.stsd(meta), MP4.stts(meta), MP4.stsc(meta), MP4.stsz(meta), MP4.stco(meta));
	} else {
		return MP4.box(MP4.types.stbl, MP4.stsd(meta), MP4.stts(meta), MP4.ctts(meta), MP4.stsc(meta), MP4.stss(meta), MP4.stsz(meta), MP4.stco(meta));
	}
}

/**
 * used for fmp4 stbl box
 */
MP4.fstbl = function (meta) {
	return MP4.box(MP4.types.stbl, // type: stbl
		MP4.stsd(meta), // Sample Description Table
		MP4.box(MP4.types.stts, MP4.symbolValue.FSTTS), // Time-To-Sample
		MP4.box(MP4.types.stsc, MP4.symbolValue.FSTSC), // Sample-To-Chunk
		MP4.box(MP4.types.stsz, MP4.symbolValue.FSTSZ), // Sample size
		MP4.box(MP4.types.stco, MP4.symbolValue.FSTCO) // Chunk offset
	);
}

MP4.stts = function (meta) {
	let {
		track
	} = meta,
	contentData = [],
		sampleDeltas = [];

	let {
		samples
	} = track, delta = samples[0].duration,
		count = 0,
		samplesLength = samples.length;

	samples.forEach(({
		duration
	}, index) => {
		if (duration === delta) {
			count++;
		} else {
			contentData.push([count, delta]);
			delta = duration;
			count = 1;
		}
		// when meet the last sample,
		// save its delta and count
		if (index === samplesLength - 1) {
			contentData.push([count, delta]);
		}
	})

	// initial countBuffer
	let sampleBuffer = new DataView(new ArrayBuffer(8 * contentData.length + 4));

	// set the entry_count
	sampleBuffer.setUint32(0, contentData.length);

	let offset = 4;
	contentData.forEach(data => {
		sampleBuffer.setUint32(offset, data[0]);
		sampleBuffer.setUint32(offset + 4, data[1]);
		offset += 8;
	});

	// version + flag + sample_counts + sample_deltas
	// TODO: set the entry_count
	return MP4.box(MP4.types.stts, MP4.symbolValue.STTS, new Uint8Array(sampleBuffer.buffer));

}

MP4.ctts = function (meta) {
	let {
		track
	} = meta,
	contentData = [],
		sampleDeltas = [];

	let {
		samples
	} = track, delta = samples[0].cts,
		count = 0,
		samplesLength = samples.length;

	samples.forEach(({
		cts
	}, index) => {
		if (cts === delta) {
			count++;
		} else {
			contentData.push([count, delta]);
			delta = cts;
			count = 1;
		}
		// when meet the last sample,
		// save its delta and count
		if (index === samplesLength - 1) {
			contentData.push([count, delta]);
		}
	})

	// initial countBuffer
	let sampleBuffer = new DataView(new ArrayBuffer(8 * contentData.length + 4));

	// set the entry_count
	sampleBuffer.setUint32(0, contentData.length);

	let offset = 4;
	contentData.forEach(data => {
		sampleBuffer.setUint32(offset, data[0]);
		sampleBuffer.setUint32(offset + 4, data[1]);
		offset += 8;
	});

	// version + flag + sample_counts + sample_deltas
	// TODO: set the entry_count
	return MP4.box(MP4.types.ctts, MP4.symbolValue.CTTS, new Uint8Array(sampleBuffer.buffer));

}

MP4.stco = function (meta) {
	let {
		samples
	} = meta.track;

	let stcoBuffer = new DataView(new ArrayBuffer(4 * samples.length + 4));

	stcoBuffer.setUint32(0, samples.length);

	let offset = 4; // skip the entry_count

	samples.forEach(sample => {
		stcoBuffer.setUint32(offset, sample.chunkOffset);
		offset += 4;
	})


	return MP4.box(MP4.types.stco, MP4.symbolValue.STCO, new Uint8Array(stcoBuffer.buffer))

}

MP4.stsc = function (meta) {
	// only set 1,1,1 to keep every sample into one chunk
	return MP4.box(MP4.types.stsc, MP4.symbolValue.STSC)
}

MP4.stsz = function (meta) {
	let {
		samples
	} = meta.track;

	let stszBuffer = new DataView(new ArrayBuffer(4 * samples.length + 8));

	stszBuffer.setUint32(0, 0); // set the sample_size to zero

	stszBuffer.setUint32(4, samples.length); // set the sample_counts

	let offset = 8;
	samples.forEach(({
		sampleSize
	}) => {
		stszBuffer.setUint32(offset, sampleSize);
		offset += 4;
	});

	return MP4.box(MP4.types.stsz, MP4.symbolValue.STSZ, new Uint8Array(stszBuffer.buffer));
}

MP4.stsd = function (meta) {

	return meta.type === 'video' ?
		MP4.box(MP4.types.stsd, MP4.symbolValue.STSD, MP4.avc1(meta)) // for AudioSampleEntry
		:
		(meta.codec === 'mp3' ? // audio
			MP4.box(MP4.types.stsd, MP4.symbolValue.STSD, MP4.mp3(meta)) // for mp3 format
			:
			MP4.box(MP4.types.stsd, MP4.symbolValue.STSD, MP4.mp4a(meta))); // for ACC , like mp4a


}

MP4.mp3 = function (meta) {
	let {
		channelCount,
		audioSampleRate
	} = meta;

	let buffer = new Uint8Array([
		0x00, 0x00, 0x00, 0x00, // reserved(4)
		0x00, 0x00, 0x00, 0x01, // reserved(2) + data_reference_index(2)
		0x00, 0x00, 0x00, 0x00, // reserved: 2 * 4 bytes
		0x00, 0x00, 0x00, 0x00,
		0x00, channelCount, // channelCount(2)
		0x00, 0x10, // sampleSize(2)
		0x00, 0x00, 0x00, 0x00, // reserved(4)
		(sampleRate >>> 8) & 0xFF, // Audio sample rate
		(sampleRate) & 0xFF,
		0x00, 0x00
	]);

	return MP4.box(MP4.types['.mp3'], buffer);
}

MP4.mp4a = function (meta) {
	let {
		channelCount,
		audioSampleRate
	} = meta;


	let buffer = new Uint8Array([
		0x00, 0x00, 0x00, 0x00, // reserved(4)
		0x00, 0x00, 0x00, 0x01, // reserved(2) + data_reference_index(2)
		0x00, 0x00, 0x00, 0x00, // reserved: 2 * 4 bytes
		0x00, 0x00, 0x00, 0x00,
		0x00, channelCount, // channelCount(2)
		0x00, 0x10, // sampleSize(2)
		0x00, 0x00, 0x00, 0x00, // reserved(4)
		(audioSampleRate >>> 8) & 0xFF, // Audio sample rate
		(audioSampleRate) & 0xFF,
		0x00, 0x00
	]);

	return MP4.box(MP4.types.mp4a, buffer, MP4.esds(meta));
}

// refer to mp4-generator.js 
MP4.esds = function (meta) {
	let config = meta.config || [],
		configLen = config.length;

	let buffer = new Uint8Array([
			0x00, 0x00, 0x00, 0x00, // version 0 + flags

			0x03, // descriptor_type
			0x17 + configLen, // length3
			0x00, 0x01, // es_id
			0x00, // stream_priority

			0x04, // descriptor_type
			0x0F + configLen, // length
			0x40, // codec: mpeg4_audio
			0x15, // stream_type: Audio
			0x00, 0x00, 0x00, // buffer_size
			0x00, 0x00, 0x00, 0x00, // maxBitrate
			0x00, 0x00, 0x00, 0x00, // avgBitrate

			0x05 // descriptor_type
		].concat([ // length AudioSpecificConfig
			configLen
		])
		.concat(config) // audio 
		.concat([0x06, 0x01, 0x02]) // GASpecificConfig
	);

	return MP4.box(MP4.types.esds, buffer);

}



MP4.avc1 = function (meta) {
	let avcc = meta.avcc,
		width = meta.codecWidth,
		height = meta.codecHeight;


	let buffer = new Uint8Array([
		0x00, 0x00, 0x00, 0x00, // reserved(4)
		0x00, 0x00, 0x00, 0x01, // reserved(2) + data_reference_index(2)
		0x00, 0x00, 0x00, 0x00, // pre_defined(2) + reserved(2)
		0x00, 0x00, 0x00, 0x00, // pre_defined: 3 * 4 bytes
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
		(width >>> 8) & 0xFF, // width: 2 bytes
		(width) & 0xFF,
		(height >>> 8) & 0xFF, // height: 2 bytes
		(height) & 0xFF,
		0x00, 0x48, 0x00, 0x00, // horizresolution: 4 bytes
		0x00, 0x48, 0x00, 0x00, // vertresolution: 4 bytes
		0x00, 0x00, 0x00, 0x00, // reserved: 4 bytes
		0x00, 0x01, // frame_count
		0x0F, // compressorname length
		0x76, 0x69, 0x6c, 0x6c, // villainhr/av.js
		0x61, 0x69, 0x6e, 0x68,
		0x72, 0x2f, 0x61, 0x76,
		0x2e, 0x6a, 0x73, 0x00,
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00,
		0x00, 0x18, // depth
		0xFF, 0xFF // pre_defined = -1
	]);

	return MP4.box(MP4.types.avc1, buffer,
		MP4.box(MP4.types.avcC, avcc) // get AVC Decoder Configuration
	);
}

MP4.mdhd = function (meta) {
	let {
		timescale,
		duration
	} = meta;


	return MP4.box(MP4.types.mdhd, new Uint8Array([
		0x00, 0x00, 0x00, 0x00, // version(0) + flags
		0x00, 0x00, 0x00, 0x00, // creation_time
		0x00, 0x00, 0x00, 0x00, // modification_time
		(timescale >>> 24) & 0xFF, // timescale: 4 bytes
		(timescale >>> 16) & 0xFF,
		(timescale >>> 8) & 0xFF,
		(timescale) & 0xFF,
		(duration >>> 24) & 0xFF, // duration: 4 bytes
		(duration >>> 16) & 0xFF,
		(duration >>> 8) & 0xFF,
		(duration) & 0xFF,
		0x55, 0xC4, // language: und (undetermined)
		0x00, 0x00 // pre_defined = 0
	]));
}

MP4.tkhd = function (meta) {
	let {
		id,
		presentWidth,
		track,
		duration,
		presentHeight
	} = meta;


	let buf = new Uint8Array([
		0x00, 0x00, 0x00, 0x07, // version(0) + flags
		0x00, 0x00, 0x00, 0x00, // creation_time
		0x00, 0x00, 0x00, 0x00, // modification_time
		(id >>> 24) & 0xFF, // track_ID: 4 bytes
		(id >>> 16) & 0xFF,
		(id >>> 8) & 0xFF,
		(id) & 0xFF,
		0x00, 0x00, 0x00, 0x00, // reserved: 4 bytes
		(duration >>> 24) & 0xFF, // duration: 4 bytes
		(duration >>> 16) & 0xFF,
		(duration >>> 8) & 0xFF,
		(duration) & 0xFF,
		0x00, 0x00, 0x00, 0x00, // reserved: 2 * 4 bytes
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x01, // layer(2bytes) + alternate_group(2bytes)
		0x01, 0x00, 0x00, 0x00, // volume(2bytes) + reserved(2bytes)
		0x00, 0x01, 0x00, 0x00, // ----begin composition matrix----
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x01, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
		0x40, 0x00, 0x00, 0x00, // ----end composition matrix----
		(presentWidth >>> 8) & 0xFF, // presentWidth and presentHeight
		(presentWidth) & 0xFF,
		0x00, 0x00,
		(presentHeight >>> 8) & 0xFF,
		(presentHeight) & 0xFF,
		0x00, 0x00
	])

	let view = new DataView(buf.buffer);


	if (meta.type === 'video') {
		view.setUint16(34, 0);
		view.setUint16(36, 0);
	}

	return MP4.box(MP4.types.tkhd, buf);
}

// MovieHeaderBox  defines overall information
MP4.mvhd = function (timescale, duration) {
	return MP4.box(MP4.types.mvhd, new Uint8Array([
		0x00, 0x00, 0x00, 0x00, // version(0) + flags
		0x00, 0x00, 0x00, 0x00, // creation_time
		0x00, 0x00, 0x00, 0x00, // modification_time
		(timescale >>> 24) & 0xFF, // timescale: 4 bytes
		(timescale >>> 16) & 0xFF,
		(timescale >>> 8) & 0xFF,
		(timescale) & 0xFF,
		(duration >>> 24) & 0xFF, // duration: 4 bytes
		(duration >>> 16) & 0xFF,
		(duration >>> 8) & 0xFF,
		(duration) & 0xFF,
		0x00, 0x01, 0x00, 0x00, // Preferred rate: 1.0
		0x01, 0x00, 0x00, 0x00, // PreferredVolume(1.0, 2bytes) + reserved(2bytes)
		0x00, 0x00, 0x00, 0x00, // reserved: 4 + 4 bytes
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x01, 0x00, 0x00, // ----begin composition matrix----
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x01, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
		0x40, 0x00, 0x00, 0x00, // ----end composition matrix----
		0x00, 0x00, 0x00, 0x00, // ----begin pre_defined 6 * 4 bytes----
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, // ----end pre_defined 6 * 4 bytes----
		0xFF, 0xFF, 0xFF, 0xFF // next_track_ID
	]));
}


MP4.init = function () {
	// set type name;
	Object
		.keys(MP4.types)
		.forEach(val => {
			// get the UTF-16 code format of name
			MP4.types[val] = [
				val.charCodeAt(0),
				val.charCodeAt(1),
				val.charCodeAt(2),
				val.charCodeAt(3)
			]
		})
}

MP4.init();



export default MP4;
