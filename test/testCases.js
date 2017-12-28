import HTTPChunked from '../src/httpchunked';


let httpChunked = new HTTPChunked('http://6721.liveplay.myqcloud.com/live/6721_269c19e388c092c26c56f7061e643d6c.flv');


/**
 * Drop TestCase
 */

//  setTimeout(function() {
//     httpChunked.drop();
//  }, 2000);



/**
 * Replace TestCase
 */

httpChunked.replace('http://6721.liveplay.myqcloud.com/live/6721_92906b20eabe2663a2fb52508377b843.flv');


/**
 * Retry TestCase
 */

//  httpChunked.retry();

