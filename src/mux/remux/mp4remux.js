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

        this._timebase = 0;
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
    generateMS(lastTimeStamp) {
        let videoMS = new Uint8Array(0),
            audioMS = new Uint8Array(0);

        if(this._videoTrack.samples.length){
            this._lastTimeStamp = lastTimeStamp;
            videoMS = this._remuxVideo();
        }

        if(this._audioTrack.samples.length){
            audioMS = this._remuxAudio();
        }

        this._videoTrack.samples = [];
        this._audioTrack.samples = [];
        this._videoTrack.length = this._audioTrack.length = 0;

        return mergeTypedArray(videoMS,audioMS);

    }

    _remuxVideoMdat() {
        let videoMdat = MP4.mdat(this._videoTrack.length);

        let offset = 8,
            track = this._videoTrack,
            meta = track.meta,
            samples = track.samples,
            mp4Samples = [];

        let baseDts = this._timebase;

        let lastPreciseDuration,tagDuration,deltaCorrect,tmpTime;

    
        samples.forEach((viSample, index) => {
            let cts = viSample.cts,
                dts,pts;
                
            let sampleSize = viSample.slices.byteLength;


            videoMdat.set(viSample.slices, offset);

            let keyFrame = viSample.keyFrame;

            if(samples.length > 1 && samples.length !== index+1){
                // loop the samples but not the last one
                tagDuration = samples[index+1].timeStamp - viSample.timeStamp;
            }else{
                tagDuration = this._lastTimeStamp - viSample.timeStamp;
            }

            this._timebase += tagDuration;

            dts = this._timebase;
            pts = dts + cts;

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
            });

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