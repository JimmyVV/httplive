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
    constructor(parent, sourceBuffer,type, options) {


        this._ms = parent._ms;
        this._type = type; // string: "audio" or "video"
        this._video = parent._video;

        this._sb = sourceBuffer;

        this._memory = Object.assign({}, {
            release: true,
            time: 5000
        }, options);

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
        if (this._tmpBuffer.length && !this._sb.updating) {

            this._sb.appendBuffer(mergeUnit8Array(this._tmpBuffer));
            this._tmpBuffer = [];
        }
    }
    
    _couldRelease() {
        let timeRanges = this._sb.buffered;

           // when the duration is NaN, throw an error. it couldn't contiue to release
        // memory
        if (this._ms.duration === NaN) {
            log.e('the mediaSource duration is NaN, ' + this._ms);

            return false;
        }

        // check sb is clearing the buffer check the sb has enough sourceBuffer
        if (!timeRanges.length) {

            log.w('the buffer length is not enough, ', timeRanges.length);

            return false;
        }

     
        // when is releasing && updaing, then quit release memory
        return !(this._isReleasing || this._sb.updating);

    }
    clearBuffer() {
        clearTimeout(this._releasing);

        if (this._sb.updating) {
            this._releasing = setTimeout(this.clearBuffer.bind(this), 0);
        } else {
            let timeRanges = this._sb.buffered,
                rangesLen = timeRanges.length;

            

            let startTime = timeRanges.start(0),
                endTime = timeRanges.end(0);

            let currentTime = this._video.currentTime;

                        

            if(currentTime < endTime){
                endTime = currentTime-0.1;
            }

            log.w('clearBuffer is : ');
            log.w('                  ', startTime,": ",endTime);
            log.w('the currentTime is : ', currentTime);



            this
                ._sb
                .remove(startTime, endTime);

            

            this.release();
        }

    }
    release() {

        // when the duration is NaN, throw an error. it couldn't contiue to release
        // memory
        if (this._ms.duration === NaN) {
            console.error('the mediaSource duration is NaN, ' + this._ms);
        }

        if (!this._couldRelease()) {
            clearTimeout(this._recursive); // prevent dev calling release() fn repeatedly
            this._recursive = setTimeout(this.release.bind(this), this._memory.time);
        }else{
            this.clearBuffer();
        }

        
    }
    _updateEnding() {
        return new Promise((res, rej) => {
            if (this._sb.updating === false) return res();

            var fn = (e) => {
                res();
                this._sb.removeEventListener('updateend', fn);
            }
            this._sb.addEventListener('updateend', fn.bind(this), false);
        })
    }
    appendBuffer(buffer) {

        this._tmpBuffer.push(buffer)

        if (!this._sb.updating) {

            this._sb.appendBuffer(mergeUnit8Array(this._tmpBuffer));

            this._tmpBuffer = [];

            // check the timeRange status 
            this._checkTimeRanges();
        }
    }
    _checkTimeRanges(){
        let timeRanges = this._sb.buffered;

        if(!timeRanges.length) return;


        log.w('the '+ this._type + ' stream: the timeRangse length ',timeRanges.length );
        log.w('start: ',timeRanges.start(0),' end: ', timeRanges.end(0),' currentTime:' , this._video.currentTime);


    }

}








export default SourceBufferControl;