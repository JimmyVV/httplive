/** 
 * for IE
 * 
 */

import XHRChunked from './xhr-chunked';

export default class XHRMSChunked extends XHRChunked{
    constructor(config){
        config.responseType = 'ms-stream';

        super(config);

        console.log('Moz Chunked connected');
    }
}

