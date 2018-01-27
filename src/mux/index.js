import FLVDemux from './demux/flvdemux';
import MP4Remux from './remux/mp4remux';
import {
    concatBuffer
} from 'debug/helper';



export default class MuxController {
    constructor() {
        this._flvDemux = new FLVDemux();

        this._mp4Remux = new MP4Remux({
            audioTrack: this._flvDemux.audioTrack,
            videoTrack: this._flvDemux.videoTrack,
            mediaInfo: this._flvDemux.mediaInfo
        });


        this._videoTrack = this._flvDemux.videoTrack;
        this._audioTrack = this._flvDemux.audioTrack;
    }
    parse(chunkArray, type = "MS") {
        this._flvDemux.parse(chunkArray);
        
        if (type === "IS") {
            let {videoIS,
                audioIS} = this._mp4Remux.generateIS();

            return {
                videoIS,
                audioIS,
                videoMime:this._flvDemux.videoMIME,
                audioMime:this._flvDemux.audioMIME
            }
        } else {

            // keep there is enough audio samples

            if (this._audioTrack.samples.length >1 && (this._videoTrack.samples.length) >1 ) {
                
                let {audioMS,videoMS} = this._mp4Remux.generateMS();
                

                return {
                    audioMS,videoMS
                }
    
            }

            return {};
 
        }
    }
}

/**
 * TODO
 *      clear audio and video 
 *      ? save the video and audio IS
 *      reset the timeBase of video and audio
 *      clear the tmpBuffer in specific sourceBuffer
 * 
 */