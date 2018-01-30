import Mitt from 'lib/mitt';
import {
    HTTPCANCEL,
    CHUNKEDSTREAM,
    CHUNKEDEND,
    CHUNKEDERR,
    CHUNKEDPROGRESS
} from 'lib/constants';
import { debug } from 'util';


export default class BaseHeader{
    
    constructor(config){
        this._config = Object.assign({
            withCredentials:true,
            timeout:0,
            retry: 1,
            cors:"cors",
        },config);

        this._url;
        this._xhr;
        this._len = 0;

        this._retry = this._config.retry;
        this._timeout = this._config.timeout;

        // the cross-origin header
        this._cors = this._config.cors; // for fetch
        this._withCredentials = this._config.withCredentials; // for xhr

        
        this._emitter = new Mitt;
    }
    addEventListener(name, fn) {
        switch (name) {
            case 'chunk':
                this._on(CHUNKEDPROGRESS, (...args) => {
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
    bind(...args) {
        this.addEventListener(...args);
    }
    on(...args) {
        this.addEventListener(...args);
    }
    // polyfill fn
    set onChunkReader(fn){
        this._chunkReader = fn;
    }

    _on(...args) {
        this._emitter.on(...args);
    }
    _emit(...args) {
        this._emitter.emit(...args);
    }
}