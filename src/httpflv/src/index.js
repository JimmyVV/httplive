import Mitt from 'lib/mitt';
import {
    HTTPCANCEL,
    CHUNKEDSTREAM,
    CHUNKEDEND,
    CHUNKEDERR
} from 'lib/constants';
import {
    mergeBuffer
} from 'lib/utils';
import HeaderRead from '../lib/header';
import {
    debug
} from 'util';
import {
    stop
} from 'debug/helper';

class HTTPChunked extends HeaderRead {
    constructor(url = '') {
        super();

        if (!window.fetch) {
            throw new Error('your browser don"t support fetch API, please use modern Browser');
        }

        this._emitter = Mitt();
        this._url = url;
        this._CANCEL = false;
        this._ERROR = false;
        this._chunk = new ArrayBuffer(0);

        this._bufferLen;
        this._readLen = 0;

        this._returnArr = [];


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
                    if (this._CANCEL) {
                        // the user drop this video
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


                    console.log('every segment len is ', value.length);

                    // this._emit(CHUNKEDSTREAM, value); // trigger the reade stream

                    this.readChunk(value.buffer);

                    if (stop(500)) {
                        this.drop(); // TODO debugger
                    }

                    return reader.read().then(chunkedReader.bind(this));
                }.bind(this))
            })
            .catch(err => {
                this._ERROR = true;

                this._emit(CHUNKEDERR, err);

                throw new Error(err);
            })
    }
    // extract the tag data
    // reader body
    // reader Tag
    //  script
    //  video
    //  audio
    readChunk(chunk) {
        // reder FLV header
        this._chunk = mergeBuffer(this._chunk, chunk);

        let tmpData, ab, view;

        this._bufferLen = this._chunk.byteLength;
        this._readLen = 0;
        this._returnArr = [];

        let type = 'MS';


        while (this._bufferLen - this._readLen > 11) {


            ab = new Uint8Array(this._chunk);


            // reader FLV File Header
            if (ab[0] === 0x46 && ab[1] === 0x4C && ab[2] === 0x56) {

                // reader FLV header
                tmpData = this._flvHeader(this._chunk.slice(0, 9));

                this._returnArr.push({
                    buffer: tmpData.buffer,
                    info: {
                        type: tmpData.type,
                        version: tmpData.version,
                        tagOffset: tmpData.tagOffset,
                        hasAudio: tmpData.hasAudio,
                        hasVideo: tmpData.hasVideo,
                    }
                })
                this._readLen += 9;
                this._chunk = this._chunk.slice(9);

                type = 'IS';

                continue;
            }

            // reader DataSize
            view = new DataView(this._chunk);

            // get the previous tag size
            let prvDataSize = view.getUint32(0);


            let dataSize = view.getUint32(4) & 16777215;

            console.log(dataSize);

            if (this._bufferLen - this._readLen < 11 + dataSize) {
                // when the remained data is not a complete tag, return;
                break;
            }
            console.log(this._returnArr);
            // decode Flv tag
            tmpData = this._flvTag(this._chunk.slice(4));


            this._returnArr.push({
                buffer: tmpData.buffer,
                info: {
                    type: tmpData.type,
                    dataOffset: tmpData.dataOffset,
                    dataSize: tmpData.dataSize,
                    timeStamp: tmpData.timeStamp,
                    tagLen: tmpData.tagLen
                }
            });

            this._chunk = this._chunk.slice(tmpData.tagLen + 4); // prvTag size
            this._readLen += tmpData.tagLen + 4;

        }

        // detect the arr is empty, then don't return
        if (!this._returnArr.length) return;

        /**
         * the type contain IS/MS:
         *      IS: initial Segment
         *      MS: media Segment
         */
        this._emit(CHUNKEDSTREAM, this._returnArr, type);


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
        this._CANCEL = false;
        this._ERROR = false;
    }
    drop() {
        this._CANCEL = true;

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

export default HTTPChunked;