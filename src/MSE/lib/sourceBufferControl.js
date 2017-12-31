import Log from 'lib/log';
import {mergeUnit8Array} from 'lib/utils';
import {downfile,concatBuffer} from 'debug/helper';

let log = new Log('SourceBufferControl');

class SourceBufferControl {
    constructor(parentMediaSource, sourceBuffer, options) {
        this._ms = parentMediaSource;

        this._sb = sourceBuffer;

        this._memory = Object.assign({}, {
            release: true,
            time: 20000
        }, options);

        this._isReleasing = false;
        this._recursive;

        this._tmpBuffer = [];

        sourceBuffer.addEventListener('update',()=>{},false);
        sourceBuffer.addEventListener('updateend',this._updateEndHandler.bind(this),false);

    }
    _updateEndHandler(){
        // append rest buffer
        if(this._tmpBuffer.length && !this._sb.updating){

            this._sb.appendBuffer(mergeUnit8Array(this._tmpBuffer));
            this._tmpBuffer = [];
        }
    }
    _releaseMemory() {
        let {release, time} = this._memory;

        // don't release memory automatically
        if (!release) 
            return;
        
        if (!this._couldRelease()) {
            setTimeout(this._releaseMemory.bind(this), 2000);
        }

        this._release();

    }
    _couldRelease() {
        let timeRanges = this._sb.buffered;

        // check sb is clearing the buffer check the sb has enough sourceBuffer
        if (timeRanges.length <= 2) {
            log.w('the buffer length is not enough, ', timeRanges.length);
            return false;
        }

        // when the duration is NaN, throw an error. it couldn't contiue to release
        // memory
        if (this._ms.duration === NaN) {
            log.e('the mediaSource duration is NaN, ' + this._ms);

            return false;
        }
        // when is releasing && updaing, then quit release memory
        return !(this._isReleasing || this._sb.updating);

    }
    _release() {
        let timeRanges = this._sb.buffered,
            rangesLen = timeRanges.length;

        let startTime = timeRanges.start(0),
            endTime = timeRanges.end(rangesLen - 2);

        this
            ._sb
            .remove(startTime, endTime);

    }
    release() {

        // when the duration is NaN, throw an error. it couldn't contiue to release
        // memory
        if (this._ms.duration === NaN) {
            throw new Error('the mediaSource duration is NaN, ' + this._ms);
        }

        if (!this._couldRelease()) {
            clearTimeout(this._recursive); // prevent dev calling release() fn repeatedly
            this._recursive = setTimeout(this.release.bind(this), 500);
        }

        this._release();
    }
    _updateEnding(){
        return new Promise((res,rej)=>{
            if(this._sb.updating === false) return res();

            var fn = (e)=>{
                res();
                this._sb.removeEventListener('updateend',fn);
            }
            this._sb.addEventListener('updateend',fn.bind(this),false);
        })
    }
    appendBuffer(buffer){
        concatBuffer(buffer,1024*200);
        this._tmpBuffer.push(buffer)

        if(!this._sb.updating){

            this._sb.appendBuffer(mergeUnit8Array(this._tmpBuffer));
            
            this._tmpBuffer = [];
        }
    }

} 








export default SourceBufferControl;