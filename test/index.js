import HTTPChunked from '../src/httpflv/lib/xhr-ff-chunked';
import MuxController from '../src/mux';
import MSE from '../src/MSE/mseControl';
import {downfile,download,downFLV,concatBuffer} from 'debug/helper';


// let httpChunked = new HTTPChunked('http://6721.liveplay.myqcloud.com/live/6721_752d2018233f1e72e1aaf48349936219.flv');
let httpChunked = new HTTPChunked();

httpChunked.send("http://6721.liveplay.myqcloud.com/live/6721_a7580dc9bee2fe09077efa645140eadd.flv");

httpChunked.on('chunk',(chunk)=>{
  console.log('the moz chunk is ', chunk);
});



setTimeout(() => {
  // httpChunked.replace("http://6721.liveplay.myqcloud.com/live/6721_a7580dc9bee2fe09077efa645140eadd.flv")
  httpChunked.drop();
}, 3000);

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

//  let sourceBuffer;


//  httpChunked.bind('stream',(stream,type)=>{

//         if(type === 'IS'){
//           let {buffer,mime} = muxController.parse(stream,type);

//           mse.addSourceBuffer(mime)
//           .then(sb=>{
//             sourceBuffer = sb;
//             sourceBuffer.appendBuffer(buffer);
//           })
//         }else{
//           let {buffer} = muxController.parse(stream,type);
          
//           if(buffer){
            
//             sourceBuffer.appendBuffer(buffer);
//           }

          
//         }
    

//  })


 /**
  * End Event TestCase
  */

// TODO 
// 1. bind
// 2. end
// 3. start