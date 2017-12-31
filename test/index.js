import HTTPChunked from '../src/httpflv/src';
import MuxController from '../src/mux';
import MSE from '../src/MSE/mseControl';
import {downfile,download,downFLV,concatBuffer} from 'debug/helper';


let httpChunked = new HTTPChunked('http://6721.liveplay.myqcloud.com/live/6721_2d77594951b1679c2940eb7feaa05d37.flv');
let muxController = new MuxController();

let mse = new MSE(document.getElementById('videoTag'));

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

 let sourceBuffer;


 httpChunked.bind('stream',(stream,type)=>{

        if(type === 'IS'){
          let {buffer,mime} = muxController.parse(stream,type);

          mse.addSourceBuffer(mime)
          .then(sb=>{
            sourceBuffer = sb;
            sourceBuffer.appendBuffer(buffer);
          })
        }else{
          let {buffer} = muxController.parse(stream,type);
          
          if(buffer){
            
            sourceBuffer.appendBuffer(buffer);
          }

          
        }
    

 })


 /**
  * End Event TestCase
  */

// TODO 
// 1. bind
// 2. end
// 3. start