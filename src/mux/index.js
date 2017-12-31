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

        this._lastVideoSample;
        this._videoTrack = this._flvDemux.videoTrack;
        this._audioTrack = this._flvDemux.audioTrack;
    }
    parse(chunkArray, type = "MS") {
        this._flvDemux.parse(chunkArray);

        let buffer = new Uint8Array(0);

        if (type === "IS") {
            return {
                buffer: this._mp4Remux.generateIS() ||  buffer,
                mime: this._flvDemux.MIME
            }
        } else {
            // cache at least 2 video tags
            if (this._videoTrack.samples.length > 1) {
                
                this._lastVideoSample = this._videoTrack.samples.pop();
                this._videoTrack.length -= this._lastVideoSample.length;

                buffer = this._mp4Remux.generateMS(this._lastVideoSample.timeStamp) || buffer;
                
                
                this._videoTrack.samples = [this._lastVideoSample];
                this._videoTrack.length = this._lastVideoSample.length;
                this._audioTrack.samples = [];
                this._audioTrack.length = 0;
            }

            return {
                buffer
            }

        }



        

    }
}