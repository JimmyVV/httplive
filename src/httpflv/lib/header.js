import {
    debug
} from "util";

export default class HeaderRead {
    constructor() {
        this.type = {
            0: 'header',
            8: 'audio',
            9: 'video',
            18: 'script',
            
        }

        this._desc = ['header', 'body'];

        this._hasVideo = false;
        this._hasAudio = false;

        /**
         * the default value 2, indicate that
         *      IS must contain header and script data by default
         */
        this._ISLength = 2;

    }
    _flvHeader(chunk) {
        let data = chunk.slice(3);
        let view = new DataView(data),
            version = view.getUint8(0),
            flags = view.getUint8(1),
            tagOffset = view.getUint32(2);

        let hasVideo = true,
            hasAudio = true;

        this._hasVideo = hasVideo;
        this._hasAudio = hasAudio;

        hasAudio && this._ISLength++;
        hasVideo && this._ISLength++;

        /**
         * some data stream is unstandard,
         * just ignore the data stream
         */
        // if (flags !== 5) {
        //     hasAudio = !!(flags & 4 >> 2);
        //     hasVideo = !!(flags & 1);
        // }



        return {
            type: this.type[0],
            version,
            desc:this._desc[0],
            tagOffset,
            hasAudio,
            hasVideo,
            buffer: chunk
        }

    }
    _flvTag(chunk) {
        let view = new DataView(chunk);

        let type = this.type[view.getUint8(0)];


        let dataSize = view.getUint32(0) & 16777215;

        let dataOffset = 11;

        let timeStamp = view.getUint32(4) >> 8;

        let upperTime = view.getUint8(7);

        if (upperTime !== 0) {
            timeStamp |= (upperTime << 24);
        }

        /**
         * confirm the prop of chunk, header or body:
         *     video: 0-header,1-body
         *     audio: 0-header,1-body
         */
        let desc = this._desc[view.getUint8(12)] || "body";

        // when the data is script, set the desc always be header
        desc = type === 'script'? 'header':desc;


        return {
            type,
            desc,
            dataSize,
            timeStamp,
            dataOffset,
            tagLen: dataSize + dataOffset,
            buffer: chunk.slice(0, dataSize + dataOffset)
        }

    }
}