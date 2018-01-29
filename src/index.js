import HTTPChunked from 'httpflv/src';
import MuxController from 'mux';
import MSE from 'MSE/mseControl';
import Mitt from 'lib/mitt';
import Log from 'lib/log';

const INFO = 'info'; // send back some stream info, like video.heigth/width
const SYNC = 'sync'; // provide some timeStamp and timebase of video/audio


const log = new Log("AVFLV");
/**
 * no-worker version
 */
export default class AVFLV {
    /**
     * the entry of av.js
     * @param {Object} params 
     *  @param video {HTMLElement} necessary: the video tag
     *  @param url {String}: the httpflv url
     *  @param mse {Object}: 
     *      maxBufferTime[Number]: default is 60 (s) when to remove TimeRanges,
     *      trailedTime[Number]: defualt is 2s, the maximum of currentTime behind the ranges.end(0),
     *      keepUpdated[Boolean]: defualt is true, indicate whether fastforward currentTime to newest or not
     *      playbackRate[Number]: defualt is 1.5,  Playrate-style to catch up the time
     * @param player {Object}: params for httpChunked connectino
     * @param MuxController
     *      
     */
    constructor(params) {

        this._video = params.video;
        this._url = params.url;
        this._mseOptions = params.mse;


        this._httpChunked = new HTTPChunked(this._url);
        this._mse = new MSE(this._video, this._mseOptions);
        this._muxController = new MuxController();

        this._emitter = new Mitt;

        // only cache one IS info
        this._v_SB;
        this._a_SB;

        this._httpChunked.on('stream', this._chunkReader.bind(this));

    }
    get player() {
        return this._httpChunked;
    }
    send(url) {
        this._httpChunked.send(url);
    }
    retry(){
        this._httpChunked.retry();
    }
    _chunkReader(stream, type) {

        if (type === 'IS') {
            this._appendIS(stream, type);
        } else {
            this._appendMS(stream, type);
        }
    }
    _appendIS(stream, type) {
        // only execute once time

        if (this._v_SB) {
            log.w('already append IS header');
            return;
        }

        let {
            videoIS,
            audioIS,
            videoMime,
            audioMime,
            mediaInfo,
        } = this._muxController.parse(stream, type);

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
    _appendMS(stream, type) {
        let {
            audioMS,
            videoMS,
            videoTimebase,
            audioTimebase,
            diffTimebase,
            videoTimeStamp,
            audioTimeStamp,
        } = this._muxController.parse(stream, type);

       

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

export {
    HTTPChunked,
    MuxController,
    MSE,
}