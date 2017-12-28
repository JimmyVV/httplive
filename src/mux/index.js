import FLVDemux from './demux/flvdemux';
import MP4Remux from './remux/mp4remux';
import {concatBuffer} from 'debug/helper';

export default class MuxController{
    constructor(){
        this._flvDemux = new FLVDemux();

        this._mp4Remux = new MP4Remux({
            audioTrack:this._flvDemux.audioTrack,
            videoTrack:this._flvDemux.videoTrack,
            mediaInfo:this._flvDemux.mediaInfo
        })
    }
    parse(chunkArray,type="MS"){
        this._flvDemux.parse(chunkArray);
        let buffer;
        if(type === "IS"){
            buffer = this._mp4Remux.generateIS();
        }else{
            buffer = this._mp4Remux.generateMS();
        }

        concatBuffer(buffer,1024*100);
        
    }
}