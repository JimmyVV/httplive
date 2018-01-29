import {
    HTTPCANCEL,
    CHUNKEDSTREAM,
    CHUNKEDPROGRESS,
    CHUNKEDEND,
    CHUNKEDERR
} from 'lib/constants';
import {
    mergeBuffer
} from 'lib/utils';
import HeaderRead from '../lib/header';
import Log from 'lib/log'

import FetchChunked from '../lib/fetch-chunked';
import MozChunked from '../lib/xhr-ff-chunked';
import W3CChunked from '../lib/xhr-w3c-chunked';
import MSChunked from '../lib/xhr-ms-chunked';

import {
    detect
} from 'detect-browser';
import { debug } from 'util';


const log = new Log('HTTPChunked');

class HTTPChunked extends HeaderRead {
    constructor(url = '', config) {
        super();

        let urlType = typeof url;

        // replace the object
        if (urlType === 'object') {
            config = url;
        } else if (urlType === 'string') {
            this._url = url;
        }

        this._browser = detect();

        switch (this._browser && this._browser.name) {
            case 'chrome':
            case "safari":
                this._xhr = new FetchChunked(config);
                break;
            case 'firefox':
                this._xhr = new MozChunked(config);
                break;
            case 'edge':
                this._xhr = new MSChunked(config);
            default:
                throw new Error('your browser don"t support fetch API, please use modern Browser');
        }


        this._xhr.on('chunk', this.readChunk.bind(this));
        // this._xhr.onChunkReader = this.readChunk.bind(this);

        this._emitter = this._xhr._emitter;
        this._chunk = new ArrayBuffer(0);

        this._bufferLen;
        this._readLen = 0;

        this._ISArray = []; // put IS info
        this._MSArray = []; // put MS info


        // don't automaticall trigger


    }

    send(url) {

        console.log(this._xhr);

        // if the param@url is undefined , use the url when init  HTTPChunked(url)
        this._xhr.send(url || this._url);
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

        chunk = null;

        let tmpData, ab, view;

        this._bufferLen = this._chunk.byteLength;
        this._readLen = 0;


        while (this._bufferLen - this._readLen > 11) {


            ab = new Uint8Array(this._chunk);


            // reader FLV File Header
            if (ab[0] === 0x46 && ab[1] === 0x4C && ab[2] === 0x56) {

                // reader FLV header
                tmpData = this._flvHeader(this._chunk.slice(0, 9));

                this._ISArray.push({
                    buffer: tmpData.buffer,
                    info: {
                        type: tmpData.type,
                        desc: tmpData.desc,
                        version: tmpData.version,
                        tagOffset: tmpData.tagOffset,
                        hasAudio: tmpData.hasAudio,
                        hasVideo: tmpData.hasVideo,
                    }
                })


                this._readLen += 9;
                this._chunk = this._chunk.slice(9);


                continue;
            }


            // reader DataSize
            view = new DataView(this._chunk);

            // get the previous tag size
            // let prvDataSize = view.getUint32(0);

            this._readLen += 4; // add the 'previousTag' size

            if (this._bufferLen < 11 + this._readLen) {
                // confirm the dataSize is valid
                break;
            }
            let dataSize = view.getUint32(4) & 16777215;

            if (this._bufferLen - this._readLen < 11 + dataSize) {
                // when the remained data is not a complete tag, return;
                break;
            }

            // decode Flv tag
            tmpData = this._flvTag(this._chunk.slice(4));

            if (tmpData.desc === 'header') {
                // save the IS info
                this._ISArray.push({
                    buffer: tmpData.buffer,
                    info: {
                        type: tmpData.type,
                        desc: tmpData.desc,
                        dataOffset: tmpData.dataOffset,
                        dataSize: tmpData.dataSize,
                        timeStamp: tmpData.timeStamp,
                        tagLen: tmpData.tagLen
                    }
                });

            }else{
                // save MS info
                this._MSArray.push({
                    buffer: tmpData.buffer,
                    info: {
                        type: tmpData.type,
                        desc: tmpData.desc,
                        dataOffset: tmpData.dataOffset,
                        dataSize: tmpData.dataSize,
                        timeStamp: tmpData.timeStamp,
                        tagLen: tmpData.tagLen
                    }
                });
            }

            this._chunk = this._chunk.slice(tmpData.tagLen + 4); // prvTag size
            this._readLen += tmpData.tagLen;

        }

         /**
         * the type contain IS/MS:
         *      IS: initial Segment
         *      MS: media Segment
         * the server maybe return duplicated IS, like Header: scirpt + video + audio + video +....
         */
        if(this._ISArray.length >= this._ISLength){
            console.warn('get IS info !!!!!!!!!!');
            this._emitter.emit(CHUNKEDSTREAM, this._ISArray, 'IS');

            this._ISArray = [];
        }

        // detect the arr is empty, then don't return
        if (this._MSArray.length){

            this._emitter.emit(CHUNKEDSTREAM, this._MSArray, 'MS');

            this._MSArray = [];
        }
        


    }

    /**
     * @param {String} url: replace the origin url to a new url Object
     */
    replace(url) {
        // reset the length
        this._chunk = new ArrayBuffer(0);

        this._xhr.retry(url);
    }
    retry() {
        // reset the this._chunk
        this._chunk = new ArrayBuffer(0);

        this._xhr.retry();
    }

    drop() {
        this._xhr.drop();
    }
    addEventListener(name, fn) {
        switch (name) {
            case 'stream': // after process
                this._emitter.on(CHUNKEDSTREAM, (...args) => {
                    fn(...args)
                })
                break;
            case 'chunk': // pure chunk
                this._emitter.on(CHUNKEDPROGRESS, (...args) => {
                    fn(...args)
                })
                break;
            case 'end':
                this._emitter.on(CHUNKEDEND, (...args) => {
                    fn(...args)
                })
                break;
            case 'error':
                this._emitter.on(CHUNKEDERR, (...args) => {
                    fn(...args)
                })
                break;
            default:
                this._emitter.on(name, (...args) => {
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

}

export default HTTPChunked;