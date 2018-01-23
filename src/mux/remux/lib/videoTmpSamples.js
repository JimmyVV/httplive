export default class videoTmpSamples{
    constructor(){
        this._tmpBuffers = [];
    }
    get length(){
        return this._tmpBuffers.length;
    }
    get samples(){
        return this._tmpBuffers;
    }
}






// export default tmp;