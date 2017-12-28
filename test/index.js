import HTTPChunked from '../src/httpflv/src';
import MuxController from '../src/mux';
import {downfile,download,downFLV} from 'debug/helper';


let httpChunked = new HTTPChunked('http://6721.liveplay.myqcloud.com/live/6721_98ad430ba390a2caafe5951250cbc67d.flv');
let muxController = new MuxController();

/**
 * Drop TestCase
 */

//  setTimeout(function() {
//     httpChunked.drop();
//  }, 2000);



/**
 * Replace TestCase
 */

// httpChunked.replace('http://6721.liveplay.myqcloud.com/live/6721_92906b20eabe2663a2fb52508377b843.flv');


/**
 * Retry TestCase
 */

//  httpChunked.retry();

/**
 * Stream Event TestCase
 */

 httpChunked.bind('stream',(stream,type)=>{

        // downFLV(stream,'video');
        muxController.parse(stream,type);
    
    
    

 })


 /**
  * End Event TestCase
  */

// TODO 
// 1. bind
// 2. end
// 3. start