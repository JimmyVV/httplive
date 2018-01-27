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
            maxBufferTime: 4, // the maximum of ranges.start(0) - ranges.end(0)
            trailedTime: 2, // the maximum of currentTime behind the ranges.end(0)
            keepUpdated: true, // often fastforward currentTime to newest
        }, options);

        /**
         * the default is 2, the maximum is 3
         */
        this._maxBufferTime = Math.min(this._memory.maxBufferTime, 3);

        /**
         * alwasy keep trailed time is less than the maxBufferTime
         * in order to prevent currentTime ~== start(0).
         * otherwise, the sb will only remove a little timeRanges [start,currentTime];
         */
        this._trailedTime = Math.min(this._memory.trailedTime, this._memory.maxBufferTime - 0.5)


        this._minBufferTime =1;

        this._keepUpdated = this._memory.keepUpdated;

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
    /**
     * you must often care about the trailedTime, maxBufferTime, minBufferTime
     * when you set some param, u should alwasy keep that "end - currentTime" > "minBufferTime"
     * if the minBufferTime is small, like 0.5s, then the video will be probably choppy.
     * so the minBufferTime shoud be in [ 0 ,trailedTime], like [0,2]
     * just like: |1--------2|3------4|, minBufferTime < (3-4), and minBufferTime < trailedTime(3-4) < maxBufferTime(1-4)
     */
    _removeSegment() {
        // for live stream, the timeRanges.length always is 0

        let timeRanges = this._sb.buffered,
            start = timeRanges.start(0),
            end = timeRanges.end(0),
            currentTime = this._video.currentTime || 0,
            rangesDur = end - start;

        if (rangesDur > this._maxBufferTime) {

 
            if (this._keepUpdated) {
                /**
                 * seek forwards. 
                 * the defualt value of trailedTime is 2s
                 */
                if (currentTime < end - this._trailedTime) {
                    currentTime = this._video.currentTime = end - this._minBufferTime;
                }else{
                    currentTime = currentTime - this._minBufferTime;
                }
            }else{
                // alwasy keep the currentTime is larger that start
                if(currentTime < start){
                    // the formular is (end - start)/2 + start = (end + start)/2;
                    currentTime = this._video.currentTime = (end+start)/2 ;
                }else{
                    // get nearest I frame time.
                }

            }


            log.w('the ', this._type, ' diff ranges :', currentTime - start, 'strat:', start);



            !this._sb.updating && this._sb.remove(start, currentTime);

        }


    }


}








export default SourceBufferControl;