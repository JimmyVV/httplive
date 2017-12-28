import SourceBuffer from './sourceBufferControl';
import Log from 'lib/log';

let log = new Log('MSEControl');

class MSEControl {
    constructor() {
        this._ms = new MediaSource();

        this._SUPPORT = this._detect();
        this._sbList = [];



        this._ms.addEventListener('sourceopen', this._msOpenEvent.bind(this), false);
        this._ms.addEventListener('sourceended', this._msEndEvent.bind(this), false);
        this._ms.addEventListener('sourceclose', this._msCloseEvent.bind(this), false);
    }
    _detect() {
        let support = MediaSource.isTypeSupported;

        return {
            mp4: support('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') ||
                support('video/mp4; codecs="avc1.58A01E, mp4a.40.2"') ||
                support('video/mp4; codecs="avc1.4D401E, mp4a.40.2"') ||
                support('video/mp4; codecs="avc1.64001E, mp4a.40.2"'),
            webm: support('video/webm; codecs=vp8'),
            vp9: support('video/webm; codecs=vp9')
        }
    }
    /**
     * @return {Promise} resolve: the new sourcebuffer
     * @param {String} mime 
     */
    addSourceBuffer(mime) {
        if (typeof mime !== 'string')
            throw new Error('addSourceBuffer(): invalid type, only receive string type, ' + mime);

        if (!MediaSource.isTypeSupported(mime))
            log.e("MSE don't support this mimeType, ", mime);

        return this._msOpen()
            .then(() => {

                let sb = new SourceBuffer(this._ms, this._ms.addSourceBuffer(mime))

                this._sbList.push(sb);

                return sb;

            })
            .catch(err => {
                throw new Error(err);
            })

    }
    /**
     * @return {Promise} when the ms become open then trigger
     */
    _msOpen() {
        return new Promise((res, rej) => {
            if (this._ms.readyState === 'open') return res();

            this._ms.addEventListener('sourceopen', () => {
                res();
            }, false);
        })
    }
    _msOpenEvent() {

    }
    _msEndEvent() {

    }
    _msCloseEvent() {

    }


}