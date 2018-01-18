import { debug } from "util";

export default class HeaderRead{
    constructor(){
        this.type = {
            8:'audio',
            9:'video',
            18:'script'
        }

        this._buffer;
    }
    _flvHeader(chunk){
        let data = chunk.slice(3);
        let view = new DataView(data),
         version = view.getUint8(0),
         flags = view.getUint8(1),
         tagOffset = view.getUint32(2);

        let hasVideo = true,
            hasAudio = true;


         if(flags !== 5){
            hasAudio = !!(flags & 4 >> 2);
            hasVideo = !!(flags & 1);
         }

         // TODO header offset
         return {
             type:'header',
             version,
             tagOffset,
             hasAudio,
             hasVideo,
             buffer:chunk
         }
        
    }
    _flvTag(chunk){
        let view = new DataView(chunk);

        let type = this.type[view.getUint8(0)];


        let dataSize = view.getUint32(0) & 16777215;

        let dataOffset = 11;

        let timeStamp = view.getUint32(4) >> 8;

        let upperTime = view.getUint8(7);

        if(upperTime !== 0){
            timeStamp|= (upperTime << 24);
        }

        this._buffer = chunk.slice(0,dataSize + dataOffset);


        return {
            type,
            dataSize,
            timeStamp,
            dataOffset,
            tagLen:dataSize+dataOffset,
            buffer:this._buffer
        }

    }
}