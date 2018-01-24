export default class TrackInfo {
    constructor() {
        this._videoTrack = {
            type: 'video',
            id:1,
            /**
             * the samples Object contain:
             *  @prop cts
             *  @prop slice [ArrayBuffer] the raw AVC data
             *  @prop timeStamp [Number] the raw millsecond from the server
             *  @prop keyFrame [Boolean] keyframe or not
             *  @prop length [Number] the slices.bytenlength,
             *                          and it will change according to effective DTS ranges in _remuxVideo()
             */
            samples: [],
            length: 0, // the data length of samples
            meta: {
                type: 'video',
                id:1,
                timescale: 1000,
                duration: 0,
                codec:'',
                refSampleDuration:null,
                avcc:'', // used for stsd box
                codecWidth:'',
                codecHeight:'',
                presentWidth:0,
                presentHeight:0,
            }
        }



        this._audioTrack = {
            type: 'audio',
            id: 2,
            sequenceNumber: 0,
            /**
             * the samples Object contain:
             *  @prop dts, cts = 0
             *  @prop unit [ArrayBuffer]
             *  @prop timeStamp [Number] the absolute milesecond from server
             */
            samples: [],
            length: 0,
            meta: {
                type: 'audio',
                id: 2,
                timescale: 1000,
                duration: 0,
                codec:'',
                refSampleDuration:null,
                audioSampleRate:null,
                config:null, // us
                channelCount:null,
                codec:null,  
            }
        }

        this._flvSoundRateTable = [5500, 11025, 22050, 44100, 48000]; // 5.5kHz~44kHz
        this._hasVideo;
        this._hasAudio;

        this._mediaInfo = {
            audiocodecid: 10,
            audiodatarate: 62.5,
            audiosamplerate: 48000,
            audiosamplesize: 16,
            duration: 0,
            encoder: "Lavf57.56.101", 
            filesize: 0,
            height: 640,
            stereo: true,
            videocodecid: 7,
            videodatarate: 1171.875,
            width: 368,
            hasVideo:false,
            hasAudio:false,
        }
    }
    get videoTrack(){
        return this._videoTrack;
    }
    get audioTrack(){
        return this._audioTrack;
    }
    get mediaInfo(){
        return this._mediaInfo;
    }
    get MIME(){
        return 'video/mp4; codecs="' + this._videoTrack.meta.codec + ',' + this._audioTrack.meta.codec + '"';
    }
    get videoMIME(){
        return 'video/mp4; codecs="' + this._videoTrack.meta.codec + '"';
    }
    get audioMIME(){
        return 'audio/mp4; codecs="' + this._audioTrack.meta.codec + '"';
    }
}