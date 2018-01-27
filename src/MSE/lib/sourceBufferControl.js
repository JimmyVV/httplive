import Log from 'lib/log';
import {
    mergeUnit8Array
} from 'lib/utils';
import {
    downfile,
    concatBuffer
} from 'debug/helper';

let log = new Log('SourceBufferControl');

class SourceBufferControl {
    constructor(parent, sourceBuffer, type, options) {


        this._ms = parent._ms;
        this._type = type; // string: "audio" or "video"
        this._video = parent._video;

        this._sb = sourceBuffer;

        this._memory = Object.assign({}, {
            release: true,
            time: 5000,
            maxBufferTime: 4,
            trailedTime: 2
        }, options);

        /**
         * the default is 2, the maximum is 3
         */
        this._maxBufferTime = Math.min(this._memory.maxBufferTime,3); 

        /**
         * alwasy keep trailed time is less than the maxBufferTime
         * in order to prevent currentTime ~== start(0).
         * otherwise, the sb will only remove a little timeRanges [start,currentTime];
         */
        this._trailedTime = Math.min(this._memory.trailedTime,this._memory.maxBufferTime - 0.5)


        this._minBufferTime = 0.5;

        this._isReleasing = false;
        this._recursive;
        this._releasing;

        this._tmpBuffer = [];

        sourceBuffer.addEventListener('update', () => {}, false);
        sourceBuffer.addEventListener('updateend', this._updateEndHandler.bind(this), false);

        // now, don't to release
        // this.release();

    }
    _updateEndHandler() {
        // append rest buffer
        this._pushSegment();
    }

    appendBuffer(buffer) {

        this._tmpBuffer.push(buffer);

        this._pushSegment();

    }
    _pushSegment() {

        if (this._sb.buffered.length)
            this._removeSegment()



        if (this._tmpBuffer.length && !this._sb.updating) {

            this._sb.appendBuffer(mergeUnit8Array(this._tmpBuffer));
            this._tmpBuffer = [];
        }
    }
    _removeSegment() {
        // for live stream, the timeRanges.length always is 0

        let timeRanges = this._sb.buffered,
            start = timeRanges.start(0),
            end = timeRanges.end(0),
            currentTime = this._video.currentTime || 0,
            rangesDur = end - start;

        if(rangesDur > this._maxBufferTime){

            /**
             * seek forwards. 
             * the defualt value of trailedTime is 2s
             */
            if(currentTime < end - this._trailedTime){
                currentTime = this._video.currentTime = end - this._minBufferTime;
            }

            log.w('the ', this._type,' diff ranges :', currentTime - start, 'strat:', start);

            !this._sb.updating && this._sb.remove(start,currentTime);

        }


    }


}








export default SourceBufferControl;