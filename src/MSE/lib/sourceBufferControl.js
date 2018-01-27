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
            maxBufferTime: 60, // the maximum of ranges.start(0) - ranges.end(0)
            trailedTime: 2, // the maximum of currentTime behind the ranges.end(0)
            keepUpdated: true, // often fastforward currentTime to newest
            playbackRate: 1.5, // rate-style catch up the time
        }, options);

        /**
         * the default is 2, the maximum is 3
         */
        this._maxBufferTime = this._memory.maxBufferTime;

        /**
         * alwasy keep trailed time is less than the maxBufferTime
         * in order to prevent currentTime ~== start(0).
         * otherwise, the sb will only remove a little timeRanges [start,currentTime];
         */
        this._trailedTime = this._memory.trailedTime;

        this._keepUpdated = this._memory.keepUpdated;

        this._playbackRate = this._memory.playbackRate;


        this._tmpBuffer = [];

        sourceBuffer.addEventListener('update', () => {}, false);
        sourceBuffer.addEventListener('updateend', this._updateEndHandler.bind(this), false);


    }
    _updateEndHandler() {
        // append rest buffer
        this._pushSegment();
    }

    appendBuffer(buffer) {

        this._tmpBuffer.push(buffer);

        this._pushSegment();

    }
    _catchUpTime() {
        if (this._keepUpdated) {
            let currentTime = this._video.currentTime,
                end = this._sb.buffered.end(0);

            /**
             * seek forwards. 
             * the defualt value of trailedTime is 1s
             */
            if (currentTime < end - this._trailedTime) {
                log.w('change the rate ', this._playbackRate, 'currentTime: ', currentTime, 'end:', end);
                this._video.playbackRate = this._playbackRate;

            } else {


                /**
                 * when the video almost catch up the end, 
                 * then play as normal
                 */
                this._video.playbackRate = 1.0;
            }



        }
    }
    _pushSegment() {

        if (this._sb.buffered.length){
            // star to play
            this._removeSegment();
            this._catchUpTime();

        }



        if (this._tmpBuffer.length && !this._sb.updating) {
            /**
             * the length of mergeUnit8Array(this._tmpBuffer) should follow the rules:
             *  video's maximum: 150MB
             *  audio's maxiumu: 12MB
             */


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
     * 
     * MSE internal memory is 60-120MB, 12MB for audio, 150MB for video. if it is full, it will throw error
     */
    _removeSegment() {
        // for live stream, the timeRanges.length always is 0

        let timeRanges = this._sb.buffered,
            start = timeRanges.start(0),
            end = timeRanges.end(0),
            currentTime = this._video.currentTime || 0;

        /**
         * check ranges between currentTime and start
         */

        if (currentTime - start > this._maxBufferTime) {

            log.w('the ', this._type, ' diff ranges :', currentTime - start, 'strat:', start, 'end: ', end, 'currentTime: ', currentTime);

            currentTime = start + this._maxBufferTime * 0.8; // when the maxBuffer Time is 30, then remove (0,24s) ranges;

            !this._sb.updating && this._sb.remove(start, currentTime);
        }






    }


}








export default SourceBufferControl;