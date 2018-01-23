import Log from 'lib/log';
import BaseInfo from './lib/baseinfo';
import AMF from './lib/amf';
import AVC from './avcdemux';
import AAC from './aacdemux';


const log = new Log('FLVDemux');

export default class FLVDemux extends BaseInfo {
    constructor() {
        super();
        this._type = {
            header: 'header',
            video: "video",
            audio: "audio",
            script: "script"
        }

        // we don't get return of function to save values just pass the video and audio
        // object to save values all following code have only one entry -- parse()
        this.AVC = new AVC({
            videoTrack: this._videoTrack,
            mediaInfo: this._mediaInfo
        });
        this.AAC = new AAC({
            audioTrack: this._audioTrack,
            mediaInfo: this._mediaInfo
        });

    }
    parse(chunkArray) {
        for (var chunk of chunkArray) {
            let info = chunk.info;
            switch (info.type) {
                case this._type.header:
                    this._mediaInfo.hasVideo = info.hasVideo;
                    this._mediaInfo.hasAudio = info.hasAudio;
                    break;
                case this._type.video:
                    if (!this._mediaInfo.hasVideo) return log.w('The FLVheader indicates hasVideo ', this._hasVideo, ' but accidentally enounter a video tag', chunk)
                    this._parseVideo(chunk);
                    break;
                case this._type.audio:
                    if (!this._mediaInfo.hasAudio) return log.w('The FLVheader indicates hasVideo ', this._hasAudio, ' but accidentally enounter a audio tag', chunk)
                    this._parseAudio(chunk);
                    break;
                case this._type.script:
                    this._parseScript(chunk);
                    break;
            }
        }
    }
    _parseVideo(chunk) {
        let {
            buffer,
            info
        } = chunk;

        buffer = buffer.slice(info.dataOffset);

        let header = new DataView(buffer).getUint8(0),
            frameType = (header & 240) >>> 4,
            codecId = header & 15;

        if (codecId !== 7) {
            log.e("It is only support AVC format(7), but you type code is " + codecId);
            return;
        }

        this.AVC.parse(buffer.slice(1), frameType, codecId,info.timeStamp);

    }
    _parseAudio(chunk) {
        let {buffer,info} = chunk;

        buffer = buffer.slice(info.dataOffset);

        let v = new DataView(buffer);

        let soundSpec = v.getUint8(0);

        let soundFormat = soundSpec >>> 4;
        if (soundFormat !== 2 && soundFormat !== 10) {
            // only support MP3 or ACC format
            log.e('we do not support this type' + soundFormat);
            return;
        }

        let soundRate = (soundSpec & 12) >>> 2;
        if (soundRate >= 0 && soundRate <= 4) {
            soundRate = this._flvSoundRateTable[soundRate];
        } else {
            log.e('Invalid soundRate: ' + soundRate);
            return;
        }

        let soundSize = (soundSpec & 2) >>> 1; // unused
        let soundType = (soundSpec & 1);

        let meta = this._audioTrack.meta;

        meta.audioSampleRate = soundRate;
        meta.channelCount = (soundType === 0
            ? 1
            : 2); // mono or stereo

        v = null;

        buffer = buffer.slice(1);

        if(soundFormat === 2){
            // MP3
        }else if(soundFormat === 10){
            // AAC
            this.AAC.parse(buffer,info.timeStamp)

        }


    }
    _parseScript(chunk) {
        let {
            buffer,
            info
        } = chunk;

        let scriptData = AMF.parseScriptData(buffer, info.dataOffset, info.dataSize);

        Object.assign(this._mediaInfo, scriptData.onMetaData);

    }
}