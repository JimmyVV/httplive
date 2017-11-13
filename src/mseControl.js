class MSEControl {
    constructor() {
        this._ms = new MediaSource();

        this._SUPPORT = this._detect();
    }
    _detect() {
        let support = MediaSource.isTypeSupported;
        MediaSource.isTypeSupported('video/webm; codecs=vp8')
        return {
            mp4: support('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') ||
                support('video/mp4; codecs="avc1.58A01E, mp4a.40.2"') ||
                support('video/mp4; codecs="avc1.4D401E, mp4a.40.2"') ||
                support('video/mp4; codecs="avc1.64001E, mp4a.40.2"'),
            webm: support('video/webm; codecs=vp8'),
            vp9: support('video/webm; codecs=vp9')
        }
    }
}