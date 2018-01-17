/** 
 * for firefox to read chunked buffer
*/


import BaseHeader from './baseheader';
import {
    CHUNKEDEND,
    CHUNKEDERR,
    CHUNKEDPROGRESS
} from 'lib/constants';


/**
 * @param config:
 *          withCredentials:true,
            timeout:0, // waiting for XHR pending
            retry: 1,
 * it provide some API:
 *  send(url)
 *  retry()
 *  drop()
 *  replace()
 * if you want to receive the chunked data,
 *  you can write some code like:
```
this._chunk = new XHRMozChunked({
    retry:2
});


this._chunk.on('chunk',(chunk,type)=>{
    //...
})

//end 
this._chunk.on('end',(chunk,type)=>{
    //...
})

// error
this._chunk.on('error',(chunk,type)=>{
    //...
})
```
 * 
 * 
 */

export default class W3CChunked extends BaseHeader{
    constructor(config){
        super(config);
        
    }
    send(url){
        this._xhr && this.drop(); // if it is used, clear it


        const xhr = this._xhr = new XMLHttpRequest();

        this._url = url;

        xhr.open('GET',url, true);
        // xhr.responseType = 'arraybuffer';

        xhr.onerror = this._onError.bind(this);
        xhr.onprogress = this._onProgress.bind(this);
        xhr.onload = this._onLoad.bind(this);
        xhr.responseType = 'arraybuffer';
        xhr.withCredentials = false;
        xhr.timeout = this.timeout;
        xhr.send();
    }

    _onProgress(e){
        let chunk = this._xhr.response;
        e;

        
        // if(!chunk){
        //     console.error('the chunked buffer is null ',chunk);
        // }
        if(this._xhr.readyState === 3){
            e.target.response
           
            debugger

            // this.xhr.responseText;

            // super._emit(CHUNKEDPROGRESS, chunk.slice(this._len));

            // this._len += chunk.length;
        }

      

    }
    _onLoad(e){

        this._xhr.readyState;

        debugger;
    }
    _onError(e){
        clearTimeout(this._retryTimer);

        this._retryTimer = this._retry >0 && setTimeout(() => {
            this.retry();
        }, 3000);

        this._retry--; // only retry 

        throw new Error(e);
    }
    drop(){
        this._xhr.abort();
    }
    retry(){
        this.drop();
        this.send(this._url);
    }
    replace(url){
        this.drop();
        this.send(url);
    }
}