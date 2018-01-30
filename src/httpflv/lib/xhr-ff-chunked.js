/** 
 * for firefox to read chunked buffer
*/


import XHRChunked from './xhr-chunked';

export default class XHRMozChunked extends XHRChunked{
    constructor(config){
        config.responseType = 'moz-chunked-arraybuffer';

        super(config);

        console.log('Moz Chunked connected');

    }
}
