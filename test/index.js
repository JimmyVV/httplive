import HTTPChunked from '../src/httpflv/src';
import MuxController from '../src/mux';
import MSE from '../src/MSE/mseControl';
import {stop} from 'debug/helper';
import {downfile,download,downFLV,concatBuffer} from 'debug/helper';


let httpChunked = new HTTPChunked();

httpChunked.send("http://6721.liveplay.myqcloud.com/live/6721_411d9a5eee9c65aec060b9a9d20a350f.flv");





// setTimeout(() => {
//   // httpChunked.replace("http://6721.liveplay.myqcloud.com/live/6721_a7580dc9bee2fe09077efa645140eadd.flv")
//   httpChunked.drop();
// }, 3000);



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
 let muxController = new MuxController();

 let mse = new MSE(document.getElementById('videoTag'));

 httpChunked.bind('stream',(stream,type)=>{
        if(stop(10)){
          console.log('drop');
          httpChunked.drop();
        }


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