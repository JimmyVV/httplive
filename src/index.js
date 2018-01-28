import HTTPChunked from 'httpflv/src';
import MuxController from 'mux';
import MSE from 'MSE/mseControl';
import Log from 'lib/log';


const log = new Log("AV");
/**
 * no-worker version
 */
export default class AV {
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

        this._video.addEventListener('canplaythrough', () => {
            this._video.play();
        }, false);
        this._video.addEventListener('error', function(e){
            console.error(e.target.error);
        }, false);
    

        // only cache one IS info
        this._v_SB;
        this._a_SB;

        this._httpChunked.on('stream', this._chunkReader.bind(this));

    }
    get player(){
        return this._httpChunked;
    }
    send(url) {
        this._httpChunked.send(url);
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
            audioMime
        } = this._muxController.parse(stream, type);

        this._v_SB = this._mse.addSourceBuffer(videoMime, 'video');
        this._a_SB = this._mse.addSourceBuffer(audioMime, 'audio');

        this._v_SB.appendBuffer(videoIS);
        this._a_SB.appendBuffer(audioIS);
    }
    _appendMS(stream, type) {
        let {
            audioMS,
            videoMS
        } = this._muxController.parse(stream, type);


        audioMS && this._a_SB.appendBuffer(audioMS);
        videoMS && this._v_SB.appendBuffer(videoMS);
    }
}

export {
    HTTPChunked,
    MuxController,
    MSE,
}