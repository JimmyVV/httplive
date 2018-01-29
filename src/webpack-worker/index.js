
import worker from 'webworkify-webpack'
import MSE from 'MSE/mseControl';
import {RETRYURL,FETCHURL,InitialSeg,MediaSeg} from './lib/constants';
import Log from 'lib/log';
import Mitt from 'lib/mitt';

const log = new Log("AVFLV");

const INFO = 'info'; // send back some stream info, like video.heigth/width
const SYNC = 'sync'; // provide some timeStamp and timebase of video/audio

export default class AVFLV{
    constructor(params){
        this._worker = worker(require.resolve('./chunks.worker'));

        this._video = params.video;
        this._mseOptions = params.mse;

        this._mse = new MSE(this._video, this._mseOptions);

        this._worker.addEventListener('message',this._messageHandler.bind(this));
        this._worker.addEventListener('error',this._errorHandler.bind(this));

        // only cache one IS info
        this._v_SB;
        this._a_SB;

        this._emitter = new Mitt;

    }
    _errorHandler(e){
        throw new Error(e.message + " (" + e.filename + ":" + e.lineno + ")");
    }
    _messageHandler(e){
        let {event} = e.data;

        switch(event){
            case InitialSeg:
                this._appendIS(e.data);
            break;
            case MediaSeg:
                this._appendMS(e.data);
            break;
        }
    }
    _appendIS(data){
        if(this._v_SB){
            log.w('already append IS header');
            return;
        }

        let {
            videoIS,
            audioIS,
            videoMime,
            audioMime,
            mediaInfo,
        } = data;


         // IntialSegment Info
         this._emitter.emit(INFO, {
            mediaInfo,
            videoMime,
            audioMime,
        });

        this._v_SB = this._mse.addSourceBuffer(videoMime, 'video');
        this._a_SB = this._mse.addSourceBuffer(audioMime, 'audio');

        this._v_SB.appendBuffer(videoIS);
        this._a_SB.appendBuffer(audioIS);
        

    }
    _appendMS(data){
        let {
            audioMS,
            videoMS,
            videoTimebase,
            audioTimebase,
            diffTimebase,
            videoTimeStamp,
            audioTimeStamp,
        } = data;

        if(audioMS && videoMS){

            this._a_SB.appendBuffer(audioMS);
            this._v_SB.appendBuffer(videoMS);

            // MediaSegment timeStamp Info
            this._emitter.emit(SYNC, {
                videoTimebase,
                audioTimebase,
                diffTimebase,
                videoTimeStamp,
                audioTimeStamp,
            });

        }
    }
    send(url){
        this._worker.postMessage({
            event: FETCHURL,
            url
        })
    }
    retry(){
        this._worker.postMessage({
            event:RETRYURL,
        })
    }
    addEventListener(name, fn) {
        switch (name) {
            case INFO:
                this._emitter.on(INFO, (...args) => {
                    fn(...args)
                })
                break;
            case SYNC:
                this._emitter.on(SYNC, (...args) => {
                    fn(...args)
                })
                break;
            default:
                this._emitter.on(name, (...args) => {
                    fn(...args)
                })
        }
    }
    bind(...args) {
        this.addEventListener(...args);
    }
    on(...args) {
        this.addEventListener(...args);
    }
}

