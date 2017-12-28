import MP4 from './lib/mp4_generator';
import {
    mergeTypedArray
} from 'lib/utils';

export default class MP4Remux {
    constructor({
        audioTrack,
        videoTrack,
        mediaInfo
    }) {
        this._audioTrack = audioTrack;
        this._videoTrack = videoTrack;
        this._mediaInfo = mediaInfo;

        this._seq = 0;
        this._lastTimeStamp;
        this._lastDuration;
    }
    generateIS() {
        let {
            hasVideo,
            hasAudio
        } = this._mediaInfo;
        if (hasVideo && hasAudio) {
            return MP4.initBox(this._videoTrack.meta, this._audioTrack.meta);
        }
    }
    generateMS() {
        let videoMS = new Uint8Array(0),
            audioMS = new Uint8Array(0);

        if(this._videoTrack.samples.length){
            videoMS = this._remuxVideo();
        }

        if(this._audioTrack.samples.length){
            audioMS = this._remuxAudio();
        }

        this._videoTrack.samples = [];
        this._audioTrack.samples = [];
        this._videoTrack.length = this._audioTrack.length = 0;

        return mergeTypedArray(audioMS);

    }

    _remuxVideoMdat() {
        let videoMdat = MP4.mdat(this._videoTrack.length);

        let offset = 8,
            track = this._videoTrack,
            meta = track.meta,
            samples = track.samples,
            mp4Samples = [];

        let baseDts = samples[0].dts;

        let lastPreciseDuration,tagDuration,deltaCorrect,tmpTime;

        console.log(this._videoTrack);
        console.log(this._audioTrack);

        samples.forEach((viSample, index) => {
            let dts = viSample.dts,
                cts = viSample.cts,
                pts = dts + cts;


            let sampleSize = viSample.slices.byteLength;
            
            videoMdat.set(viSample.slices, offset);

            

            let keyFrame = viSample.keyFrame;

            if(this._lastTimeStamp){
                tagDuration = meta.refSampleDuration;
                this._lastDuration = tagDuration;
                this._lastTimeStamp = viSample.timeStamp;
            }else{
                if(samples[index+1] && index !==0 ){
                    // not first tag
                    tagDuration = samples[index + 1].timeStamp - viSample.timeStamp;
                }else{
                    // the first tag or only one tag or the last tag

                    if(samples.length > 1 && index !== (samples.length - 1) ){
                        // the first Tag
                        tmpTime = samples[1].timeStamp - samples[0].timeStamp;
                    }else{
                        // only one tag or the last tag
                        tmpTime = this._lastDuration;
                    }
                    // the firs tag or only tag
                    lastPreciseDuration = viSample - this._lastTimeStamp;
                    deltaCorrect = lastPreciseDuration - this._lastDuration;
                    tagDuration = tmpTime + deltaCorrect;

                    this._lastDuration = tagDuration;
                    this._lastTimeStamp = viSample.timeStamp;
                }


            }

            meta.duration += tagDuration;

            mp4Samples.push({
                dts,
                pts,
                cts,
                length: viSample.length,
                keyFrame,
                sampleSize,
                duration: tagDuration,
                chunkOffset: offset,
                flags: {
                    isLeading: 0,
                    dependsOn: keyFrame ?
                        2 : 1, // an I picture : not I picture
                    isDepended: keyFrame ?
                        1 : 0, //  unknown dependent sample: not disposable
                    hasRedundancy: 0, // for sdtp
                    isNonSync: keyFrame ?
                        0 : 1
                }
            })


            offset += viSample.length;
        });
        console.log(mp4Samples);

        track.samples = mp4Samples;
        this._seq++;

        return {
            videoMdat,
            baseDts
        }

    }
    
    _remuxAudio(){
        let {
            audioMdat,baseDts
        } = this._remuxAudioMdat();

        let moof = MP4.moof(this._audioTrack,baseDts,this._seq);

        return mergeTypedArray(moof,audioMdat);
    }

    _remuxVideo() {
        let {
            videoMdat,
            baseDts
        } = this._remuxVideoMdat();

        let moof = MP4.moof(this._videoTrack, baseDts, this._seq);


        return mergeTypedArray(moof, videoMdat);
    }
    _remuxAudioMdat(){
        let audioMdat = MP4.mdat(this._audioTrack.length);

        let offset = 8,
            track = this._audioTrack,
            meta = track.meta,
            refDuration = meta.refSampleDuration,
            samples = track.samples,
            baseDts = samples[0].dts,
            mp4Samples = [];

        samples.forEach((accSample,index)=>{
            let dts = accSample.dts,
            pts = accSample.pts,
            cts = pts - dts;
            
            audioMdat.set(accSample.unit, offset);

			let sampleSize = accSample.unit.byteLength;


            mp4Samples.push({
                dts,
				pts,
                cts: 0,
                sampleSize,
                duration:refDuration,
                chunkOffset:offset,
                flags: {
					isLeading: 0,
					dependsOn: 1, // origin is 1
					isDepended: 0,
					hasRedundancy: 0
				}
            })

            offset += sampleSize;

        });

        track.samples = mp4Samples;
        this._seq++;

        return {
            baseDts,
            audioMdat
        }

    }
   
   
}