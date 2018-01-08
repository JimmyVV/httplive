import Mitt from 'lib/mitt';
import {
    HTTPCANCEL,
    CHUNKEDSTREAM,
    CHUNKEDEND,
    CHUNKEDERR,
    CHUNKEDPROGRESS
} from 'lib/constants';


export default class BaseHeader{
    
    constructor(config){
        this._config = Object.assign({
            withCredentials:true,
            timeout:0,
            retry: 1,
            cors:true,
            chunkResolve:function(){}
        },config);

        this._url;
        this._xhr;
        this._len = 0;

        this._retry = this._config.retry;
        this._cors = this._config.cors;
        this._retryTimer;

        this._emitter = new Mitt;
    }
    get withCredentials(){
        return this._config.withCredentials;
    }
    get timeout(){
        return this._config.timeout;
    }
    get reconnection(){
        return this._config.reconnection;
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

    _on(...args) {
        this._emitter.on(...args);
    }
    _emit(...args) {
        this._emitter.emit(...args);
    }
}