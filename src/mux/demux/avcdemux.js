import Log from 'lib/log';
import {mergeTypedArray} from 'lib/utils';
import SPSParser from './lib/sps_parse';


const log = new Log('AVCDemux')

export default class AVCDemux {
    constructor({
        videoTrack,
        mediaInfo
    }) {
        this._videoTrack = videoTrack;
        this._mediaInfo = mediaInfo;


        // set the default frame rate if is not fixed
        this._referenceFrameRate = {
            fixed: true,
            fps: 23.976,
            fps_num: 23976,
            fps_den: 1000
        };

        this._naluLengthSize = 4;
        this._timestampBase = 0;

        this._keyFrame = {1:true,2:false};
    }

    parse(chunk, frameType, codecId,timeStamp) {

        let v = new DataView(chunk);

        let type = v.getUint8(0),
            cts = v.getUint32(0) & 0x00FFFFFF;

        v = null;

        chunk = chunk.slice(4);

        switch (type) {
            case 0:
                this._parseConfig(chunk);
                break;
            case 1:
                this._parseAVC(chunk,{cts,frameType,timeStamp});
                break;
            case 2:
                // empty
        }
    }
    /**
     * 
     * @param {*} chunk 
     * @param {*} Object
     */
    _parseAVC(chunk,{cts,frameType,timeStamp}) {
        let v = new DataView(chunk);

        let slices = [],
            dataSize = chunk.byteLength,
            offset = 0;

        let keyFrame = !!this._keyFrame[frameType];

        let naluLen = this._naluLengthSize;
        let dts = this._timestampBase;

        this._timestampBase += this._videoTrack.meta.refSampleDuration;

        while(offset < dataSize ){
            if (offset + 4 >= dataSize) {
                log.w('not enought data to parse')
                break; // data not enough for next Nalu
            }

             // AVC1 decode
             let naluSize = v.getUint32(offset); // Big-Endian read
             if (naluLen === 3) {
                 naluSize >>>= 8;
             }
 
             if (naluSize > dataSize - naluLen) {
                 log.w('invalid nalu value');
                 return;
             }
 
             let sliceType = v.getUint8(offset + naluLen) & 0x1F;
 
             if (sliceType === 5) {
                 // ?
                 keyFrame = true;
             }
 
             let data = new Uint8Array(chunk, offset, naluLen + naluSize);
            
             slices.push(data);
 
 
             offset += naluLen + naluSize;
        }

        slices = mergeTypedArray.apply(null,slices);


        if(slices.length){
            this._videoTrack.samples.push({
                slices,
                length:offset,
                keyFrame,
                dts,
                cts,
                pts: (dts + cts)
            });
            this._videoTrack.length += offset;
        }
    }
    _parseConfig(chunk) {
        let v = new DataView(chunk);

        let version = v.getUint8(0); // configurationVersion
        let avcProfile = v.getUint8(1); // avcProfileIndication
        let profileCompatibility = v.getUint8(2); // profile_compatibility
        let avcLevel = v.getUint8(3); // AVCLevelIndication

        if (version !== 1 || avcProfile === 0) {
            log.e('Invalid AVCDecoderConfigurationRecord')
            return;
        }

        let nalu_len = this._naluLengthSize = (v.getUint8(4) & 3) + 1; // lengthSizePlusOne
        if (nalu_len !== 3 && nalu_len !== 4) {
            log.e('Invalid NaluLengthSizeMinusOne: ' + nalu_len);
            return;
        }

        let spsCount = v.getUint8(5) & 31; // get SequenceParameterSets count

        if (spsCount === 0) {
            log.e('the SequenceParameterSets count couldn"t be 0');
            return;
        } else if (spsCount > 1) {
            log.e('strange count of SPS, it should be 1 as usual');
        }

        // skip over 6B header
        let offset = 6;

        // start to decode SPS usually has only one SPS
        for (let i = 0; i < spsCount; i++) {

            // skip over decoding other strange AVCDecoderConfigurationRecord
            if (i > 0)
                continue;

            // the divided flag is not the start code 00 00 00 01, but the 4B length of SPS
            let spsLen = v.getUint16(offset);
            offset += 2;

            if (!spsLen)
                continue;

            let sps = new Uint8Array(chunk, offset, spsLen);

            offset += spsLen;

            let metaInfo = SPSParser.parseSPS(sps);

            this._extrackInfo(metaInfo, sps);

        }

        this._videoTrack.meta.avcc = new Uint8Array(chunk);

        console.log('parsed already, ', this._videoTrack);
    }
    _extrackInfo(spsInfo, sps) {
        let meta = this._videoTrack.meta;

        meta.spsInfo = spsInfo;
        meta.codecWidth = spsInfo.codec_size.width;
        meta.codecHeight = spsInfo.codec_size.height;
        meta.presentWidth = spsInfo.present_size.width;
        meta.presentHeight = spsInfo.present_size.height;

        console.log(spsInfo);
        if (spsInfo.frame_rate.fixed === false || spsInfo.frame_rate.fps_num === 0 || spsInfo.frame_rate.fps_den === 0) {
            meta.frameRate = this._referenceFrameRate;
        }

        let {
            fps_den,
            fps_num
        } = meta.frameRate;
        meta.refSampleDuration = Math.floor(meta.timescale * (fps_den / fps_num));

        // get AVC codec
        let codecArray = sps.subarray(1, 4);
        let codecString = 'avc1.';
        for (let j = 0; j < 3; j++) {
            let h = codecArray[j].toString(16);
            if (h.length < 2) {
                h = '0' + h;
            }
            codecString += h;
        }
        meta.codec = codecString;
    }

}