import HTTPChunked from 'httpflv/src';
import MuxController from 'mux';
import {RETRYURL,FETCHURL,InitialSeg,MediaSeg} from './lib/constants';
import { debug } from 'util';


class WorkerController{
    constructor(){
        this._httpChunked = new HTTPChunked();
        this._muxController = new MuxController();


        self.addEventListener('message',this._messageHandler.bind(this));
        this._httpChunked.on('stream',this._chunkReader.bind(this));
    }
    _messageHandler(e){
        let {event} = e.data;

        switch(event){
            case FETCHURL:
                this._httpChunked.send(e.data.url);
            break;
            case RETRYURL:
                this._httpChunked.retry();
            break;
        }
    }
    _chunkReader(stream,type){
        if (type === 'IS') {
            this._appendIS(stream, type);
        } else {
            this._appendMS(stream, type);
        }
    }
    _appendIS(stream,type){
        let {
            videoIS,
            audioIS,
            videoMime,
            audioMime
        } = this._muxController.parse(stream, type);

        self.postMessage({
            event:InitialSeg,
            videoIS,
            audioIS,
            audioMime,
            videoMime,
        },[videoIS.buffer,audioIS.buffer]);
    }
    _appendMS(stream,type){
        let {
            audioMS,
            videoMS
        } = this._muxController.parse(stream, type);

        

        audioMS && videoMS && self.postMessage({
            event: MediaSeg,
            audioMS,
            videoMS,
        },[audioMS.buffer,videoMS.buffer]);
    }
}

new WorkerController();