import BaseHeader from './baseheader';
import {
    CHUNKEDEND,
    CHUNKEDERR,
    CHUNKEDPROGRESS
} from 'lib/constants';

class XHRChunked extends BaseHeader{
    constructor(config){
        super(config);

        this._responseType = config.responseType || 'arraybuffer';
    }
    send(url){
        this._xhr && this.drop(); // if it is used, clear it


        const xhr = this._xhr = new XMLHttpRequest();

        this._url = url;

        xhr.open('GET',url, true);

        xhr.responseType = this._responseType;

        xhr.onerror = this._onError.bind(this);
        xhr.onprogress = this._onProgress.bind(this);

        xhr.withCredentials = this.withCredentials;
        this.timeout && (xhr.timeout = this.timeout) ;
        
        xhr.send();
    }

    _onProgress(e){
        let chunk = this._xhr.response;

        if(!chunk){
            console.error('the chunked buffer is null ',chunk);
        }

        super._emit(CHUNKEDPROGRESS, chunk.slice(this._len));

        this._len += chunk.length;

    }
    _onError(e) {
        // clearTimeout(this._retryTimer);

        // this._retryTimer = this._reconnect > 0 && setTimeout(() => {
        //     this.retry();
        // }, 3000);

        // this._reconnect--; // only retry 

        throw new Error(e);
    }
    drop(){
        this._xhr.abort();
    }
    retry(){
        this.send(this._url);
    }
    replace(url){
        this.send(url);
    }
}
