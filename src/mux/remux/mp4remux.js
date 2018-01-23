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

        this._videoSeq = 0;
        this._audioSeg = 0;
        this._lastTimeStamp;
        this._lastDuration;

        this._videoTimebase = 0;
        this._audioTimebase = 0;

        this._audioClockRange = {
            startTS:0,
            endTS:0,
        };

        this._videoTmpSamples = []


    }
    generateIS() {
        let {
            hasVideo,
            hasAudio
        } = this._mediaInfo;
        if (hasVideo && hasAudio) {
            return {
                videoIS: MP4.initBox(this._videoTrack.meta),
                audioIS: MP4.initBox(this._audioTrack.meta)
            };
        }
    }
    generateMS(lastTimeStamp) {


        let audioMS = this._remuxAudio() || new Uint8Array(0);
        let videoMS = this._remuxVideo() || new Uint8Array(0);

        console.log("the diff time is ", this._videoTimebase - this._audioTimebase)

        return {
            audioMS,
            videoMS
        }

    }

    _remuxVideoMdat() {
        let videoMdat = MP4.mdat(this._videoTrack.length);

        let offset = 8,
            track = this._videoTrack,
            meta = track.meta,
            samples = track.samples,
            mp4Samples = [];

        let baseDts = this._videoTimebase;

        let lastPreciseDuration, tagDuration, deltaCorrect, tmpTime;


        samples.forEach((viSample, index) => {
            let cts = viSample.cts,
                dts, pts;

            let sampleSize = viSample.slices.byteLength;


            videoMdat.set(viSample.slices, offset);

            let keyFrame = viSample.keyFrame;

            if (samples.length > 1 && samples.length !== index + 1) {
                // loop the samples but not the last one
                tagDuration = samples[index + 1].timeStamp - viSample.timeStamp;
            } else {
                tagDuration = this._lastTimeStamp - viSample.timeStamp;
            }

            dts = this._videoTimebase;
            pts = dts + cts;

            this._videoTimebase += tagDuration;



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


        track.samples = mp4Samples;
        this._videoSeq++;

        return {
            videoMdat,
            baseDts
        }

    }

    _remuxAudio() {
        let {
            audioMdat,
            baseDts
        } = this._remuxAudioMdat();

        let moof = MP4.moof(this._audioTrack, baseDts, this._audioSeg);

        this._audioTrack.samples = [];

        return mergeTypedArray(moof, audioMdat);
    }
    /** 
     * @desc finish four things:
     *          1. filter the effective samples from tmpBuffer and videoTrack 
     *                  which are before audio.endTS
     *          2. replace the video.samples by effective samples
     *          3. save the tmpBuffers which is beyond audio.endTS
     *          4. calculate the length of videoTack samples
     * 
    */
    _filterEffectiveVideo(){
        let startTS = this._audioClockRange.startTS,
            endTS = this._audioClockRange.endTS;
        
        let tmpBuffer = [], // the tmpBuffers array
            samples = []; // effective samples for videoTrack

        // travrse videoTmpSamples
        
        this._videoTmpSamples.forEach(sample=>{
            if(sample.timeStamp <= endTS){
                samples.push(sample)
            }else{
                tmpBuffer.push(sample)
            }
        });
    
        // travrse this._videoTrack.samples

        this._videoTrack.samples.forEach(sample=>{
            if(sample.timeStamp <= endTS){
                samples.push(sample)
            }else{
                tmpBuffer.push(sample)
            }
        });


        // when the remaining samples are beyond endTS,
        // put these samples into videoTmpSamples
        this._videoTmpSamples = tmpBuffer;
        
        // calcuate the samples.length
        this._videoTrack.length = samples.reduce((sum,val)=>{
            return sum + val.length;
        },0);

        // resolve these effective samples into this._videoTrack.samples;
        this._videoTrack.samples = samples;

    }
    _remuxVideo() {

        // get the effective length
        // filter the videoBuffer

        this._filterEffectiveVideo();

        // TODO verify/test endTS logic 

        if(this._videoTrack.samples.length === 0){
            // when the videoSamples is 
            return;
        }


        let {
            videoMdat,
            baseDts
        } = this._remuxVideoMdat();

        let moof = MP4.moof(this._videoTrack, baseDts, this._videoSeq);

        this._videoTrack.samples = []; // reset 


        return mergeTypedArray(moof, videoMdat);
    }
    _remuxAudioMdat() {
        let audioMdat = MP4.mdat(this._audioTrack.length);

        let offset = 8,
            track = this._audioTrack,
            meta = track.meta,
            refDuration = meta.refSampleDuration,
            samples = track.samples,
            baseDts = this._audioTimebase,
            mp4Samples = [];

        // set the timeStamp range
        this._audioClockRange.startTS = samples[0].timeStamp;
        this._audioClockRange.endTS = samples[samples.length-1].timeStamp;



        samples.forEach((accSample, index) => {
            let dts = this._audioTimebase,
                cts = 0,
                pts = dts + cts;

            audioMdat.set(accSample.unit, offset);

            let sampleSize = accSample.unit.byteLength;

            this._audioTimebase += refDuration;

            mp4Samples.push({
                dts,
                pts,
                cts,
                sampleSize,
                duration: refDuration,
                chunkOffset: offset,
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
        this._audioSeg++;

        return {
            baseDts,
            audioMdat
        }

    }


}