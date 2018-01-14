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

export default class FetchChunked extends BaseHeader{
    constructor(config){
        super(config);

        this._CANCEL = false;
        this._ERROR = false;
        this._reader;
        console.log("FETCH chunked");
    }
    send(url){
        this._url = url;
        debugger
        console.log("FETCH SEND url ",url);
        fetch(url,{
            mode:this._cors
        })
            .then(res=>{
                let reader = res.body.getReader();

                this._xhr = res;
                this._reader = reader;


                return this._readerTmpFn();
            })
            .then(res=>{
                console.log("all done");
            })
            .catch(err=>{
                this._ERROR = true;
                this._emit(CHUNKEDERR,err);

                throw new Error(err);
            })
    }
    _readerTmpFn(){

        return this._reader.read().then(this._chunkDecode.bind(this))
    }
    _chunkDecode({done,value}){

        if(this._CANCEL){
            if(!done){
                try {
                    console.log('drop this url, ', url);
                    this._reader.releaseLock();
                    this._xhr.body.cancel("the user decide to drop");

                    this._emit(HTTPCANCEL); // indicate that drop() fn when to resolve the promise

                    this._emit(CHUNKEDEND);

                } catch (error) {
                    throw new Error('dont"t support drop(). because you brower don"t support reader.releaseLock() API \n', error);
                }
            }
            // break the reading process
            return;
        }

        if(done){
            console.log('====================================');
            console.log('the chunked connection has stopped');
            console.log('====================================');

            this._emit(CHUNKEDEND);
            return;
        }
        this._emit(CHUNKEDPROGRESS,value.buffer);

        return this._readerTmpFn();
    }
    retry(){
        console.log('retry to connect the url,' ,this._url);

        if(this._ERROR){
            return this.send(this._url);
        }

        this.drop()
            .then(() => {
                this.send(this._url);
            })
    }
    drop(){
        this._CANCEL = true;

        return new Promise((res, rej) => {
            this._on(HTTPCANCEL, () => {

                res();
            })
        })

    }
    replace(url){
        console.log('replace the url: ', url);

        this.drop()
        .then(() => {
            this.send(url);
        })

    }
    _init(){
        this._CANCEL = false;
        this._ERROR = false;
    }
}