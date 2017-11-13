import Mitt from 'mitt';
import {
    HTTPCANCEL,
    CHUNKEDSTREAM,
    CHUNKEDEND,
    CHUNKEDERR
} from 'lib/constants';

class HTTPChunked {
    constructor(url = '') {
        if (!window.fetch) {
            throw new Error('your browser don"t support fetch API, please use modern Browser');
        }

        this._emitter = Mitt();
        this._url = url;
        this._CALCEL = false;
        this._ERROR = false;

        url && this._fetch(url);
    }
    _fetch(url) {
        this._start();

        fetch(url)
            .then(res => {
                let reader = res.body.getReader();

                reader.read().then(function chunkedReader({
                    done,
                    value
                }) {

                    // TODO 
                    // 1. when use deicide to drop the url
                    // 2. when developer wanna switch to another url
                    if (this._CALCEL) {
                        if (!done) {
                            try {
                                console.log('drop this url, ', url);
                                reader.releaseLock();
                                res.body.cancel("the user decide to drop");

                                this._emit(HTTPCANCEL);

                                this._emit(CHUNKEDEND);

                                return;
                            } catch (error) {
                                console.warn('dont"t support drop(). because you brower don"t support reader.releaseLock() API \n', error);
                            }

                        };
                    }

                    if (done) {
                        console.log('the chunked connection has stopped');
                        this._emit(CHUNKEDEND);
                        return;
                    }


                    console.log('locked state is ,', res.body.locked);
                    console.log('every segment len is ', value.length);

                    this._emit(CHUNKEDSTREAM, value); // trigger the reade stream

                    return reader.read().then(chunkedReader.bind(this));
                }.bind(this))
            })
            .catch(err => {
                this._ERROR = true;

                this._emit(CHUNKEDERR, err);

                throw new Error(err);
            })
    }

    /**
     * @param {String} url: replace the origin url to a new url Object
     */
    replace(url) {
        this._url = url;

        this.drop()
            .then(() => {
                this._fetch(url);
            })

    }
    retry() {
        console.log('retry');

        // when meet error, directly fetch the resource
        if (this._ERROR) {
            return this._fetch(this._url);
        }

        // when the fetch is good, drop it and fetch a new one
        this.drop()
            .then(() => {
                this._fetch(this._url);
            })

    }
    /**
     * triggering condition:
     *  1. when develop wanna use other url, like calling retry(xx)
     *  2. when start a new fetch, reset the cancal's state
     */
    _start() {
        this._CALCEL = false;
        this._ERROR = false;
    }
    drop() {
        this._CALCEL = true;

        return new Promise((res, rej) => {
            this._on(HTTPCANCEL, () => {

                res();
            })
        })
    }
    addEventListener(name, fn) {
        switch (name) {
            case 'stream':
                this._on(CHUNKEDSTREAM, (...args) => {
                    fn(...args)
                })
                break;
            case 'end':
                this._on(CHUNKEDEND, (...args) => {
                    fn(...args)
                })
                break;
            case 'error':
                this._on(CHUNKEDERR, (...args) => {
                    fn(...args)
                })
                break;
            default:
                this._on(name, (...args) => {
                    fn(...args)
                })
        }
    }
    bind(...args){
        this.addEventListener(...args);
    }
    on(...args){
        this.addEventListener(...args);
    }
    
    _on(...args) {
        this._emitter.on(...args);
    }
    _emit(...args) {
        this._emitter.emit(...args);
    }
}

export default HTTPChunked;