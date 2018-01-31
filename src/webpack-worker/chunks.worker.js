import HTTPChunked from 'httpflv/src';
import MuxController from 'mux';
import {
    RETRYURL,
    FETCHURL,
    InitialSeg,
    MediaSeg
} from './lib/constants';
import { debug } from 'util';


function WorkerController(self){
    let _httpChunked = new HTTPChunked();
    let _muxController = new MuxController();
    debugger
    self.addEventListener('message', _messageHandler.bind(this));
    _httpChunked.on('stream', _chunkReader.bind(this));

    function _messageHandler (e)  {
        let {
            event
        } = e.data;

        switch (event) {
            case FETCHURL:
                _httpChunked.send(e.data.url);
                break;
            case RETRYURL:
                _httpChunked.retry();
                break;
        }
    }

    function _chunkReader(stream,type){
        if (type === 'IS') {
            this._appendIS(stream, type);
        } else {
            this._appendMS(stream, type);
        }
    }

    function _appendIS (stream, type) {
        let {
            videoIS,
            audioIS,
            videoMime,
            audioMime,
            mediaInfo,
        } = _muxController.parse(stream, type);

        self.postMessage({
            event: InitialSeg,
            videoIS,
            audioIS,
            audioMime,
            videoMime,
            mediaInfo,
        }, [videoIS.buffer, audioIS.buffer]);
    }
    function _appendMS (stream, type) {
        let {
            audioMS,
            videoMS,
            videoTimebase,
            audioTimebase,
            diffTimebase,
            videoTimeStamp,
            audioTimeStamp,
        } = _muxController.parse(stream, type);



        audioMS && videoMS && self.postMessage({
            event: MediaSeg,
            audioMS,
            videoMS,
            videoTimebase,
            audioTimebase,
            diffTimebase,
            videoTimeStamp,
            audioTimeStamp,
        }, [audioMS.buffer, videoMS.buffer]);
    }

}

export default WorkerController;