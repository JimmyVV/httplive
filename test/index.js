import HTTPChunked from '../src/httpflv/src';
import MuxController from '../src/mux';
import MSE from '../src/MSE/mseControl';
import {
  downfile,
  download,
  downFLV,
  concatBuffer
} from 'debug/helper';


let httpChunked = new HTTPChunked('https://1ge51hcjw8yzdnpjtfaauepa.ourdvsss.com/live-play.acgvideo.com/live/596/live_180179454_5179394.flv?wsSecret=a8a26c753734c058dc8e0c810e8daf44&wsTime=5a3f4c95&wshc_tag=0&wsts_tag=5a66cb85&wsid_tag=e111622&wsiphost=ipdbm');
let muxController = new MuxController();

let mse = new MSE(document.getElementById('videoTag'));


document.getElementById('videoTag').addEventListener('error',error=>{
  console.error(error);
},false);
/**
 * Drop TestCase
 */

let v_SB,a_SB;


httpChunked.bind('stream', (stream, type) => {


  if (type === 'IS') {
    let {
      videoIS,
      audioIS,
      videoMime,
      audioMime
    } = muxController.parse(stream, type);

    v_SB = mse._addSourceBuffer(videoMime);
    a_SB = mse._addSourceBuffer(audioMime);
    
    // concatBuffer(videoIS,100*1024);
    v_SB.appendBuffer(videoIS);
    a_SB.appendBuffer(audioIS);
 
  } else {

    debugger

    let {
      audioMS,videoMS
    } = muxController.parse(stream, type);


    audioMS && a_SB.appendBuffer(audioMS);
    videoMS && v_SB.appendBuffer(videoMS);

    // videoMS && concatBuffer(videoMS,15000*1024);
    document.getElementById('videoTag').play();
  }


})


/**
 * End Event TestCase
 */

// TODO 
// 1. bind
// 2. end
// 3. start




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