class videoSamples{
    constructor(){
        this._tmpBuffers = [];
    }
    get length(){
        return this._tmpBuffers.length;
    }
    get buffers(){
        return this._tmpBuffers;
    }
}

export default new videoSamples;