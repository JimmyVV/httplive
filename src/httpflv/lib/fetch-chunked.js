import BaseHeader from './baseheader';
import {
    HTTPCANCEL,
    CHUNKEDPROGRESS,
    CHUNKEDSTREAM,
    CHUNKEDEND,
    CHUNKEDERR
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
this._chunk = new FetchChunked({
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

export default class FetchChunked extends BaseHeader {
    constructor(config) {
        super(config);

        this._CANCEL = false;
        this._ERROR = false;
        this._cors = config.cors || 'cors';

        this._reader;
        console.log("FETCH chunked");
    }
    send(url) {
        this._url = url;

        console.log("FETCH SEND url ", url);

        fetch(url, {
                mode: this._cors,
                referrerPolicy: 'no-referrer-when-downgrade',
                cache: 'default',
            })
            .then(res => {
                if (res.ok && (res.status >= 200 && res.status <= 299)) {

                    // this._xhr = res;
                    return this._readerTmpFn(res.body.getReader());
                } else {
                    this._emit(CHUNKEDEND);
                }

            })
            .then(res => {
                console.log("all done");
            })
            .catch(err => { 

                this._ERROR = true;
                this._emit(CHUNKEDERR, err);
                this._emit(CHUNKEDEND);

                throw new Error(err);
            })
    }
    _readerTmpFn(reader) {
        return reader.read().then(({done,value})=>{
            if (this._CANCEL) {
                if (!done) {
                    try {
                        console.log('drop this url, ', this._url);

                        reader.releaseLock();

                        this._emit(HTTPCANCEL); // indicate that drop() fn when to resolve the promise
                        this._emit(CHUNKEDEND);
    
                    } catch (error) {
                        console.error('dont"t support drop(). because you brower don"t support reader.releaseLock() API \n', error);
                    }
                }
                // break the reading process
                return;
            }
    
            if (done) {
                this._emit(CHUNKEDEND);
                return;
            }

            
            this._emit(CHUNKEDPROGRESS, value.buffer);

            // resolve the memory leak
            // never use retrun fn
            this._readerTmpFn(reader)
        }).catch(err => { 

            this._ERROR = true;
            this._emit(CHUNKEDERR, err);
            this._emit(CHUNKEDEND);

            console.error(err);
        });
    }
    retry(url) {
        console.log('retry to connect the url,', this._url);

        this._url = url || this._url;

        if (this._ERROR) {
            return this.send(this._url);
        }

        this.drop()
            .then(() => {
                this._CANCEL = false;
                this.send(this._url);
            })
    }
    drop() {
        this._CANCEL = true;

        return new Promise((res, rej) => {
            this._on(HTTPCANCEL, () => {

                res();
            })
        })

    }
    
    _init() {
        this._CANCEL = false;
        this._ERROR = false;
    }
}