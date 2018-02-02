import HTTPLive from '../dist/index.worker.min.js';
// import HTTPLive from '../src/webpack-worker/index';
// import {CustomPlayer,HTTPChunked} from '../dist/index.min.js';
import { log } from 'util';

let video = document.getElementById('videoTag');

// const HTTPLive = CustomPlayer({
//   HTTPChunked
// });

let flv = new HTTPLive({
  video,
  request:{
    cors:"cors"
  }
});

video.addEventListener('canplaythrough',()=>{
  video.play();
},false);

video.addEventListener('error',e=>{
  throw new Error(e);
},false);


flv.send('http://6721.liveplay.myqcloud.com/live/6721_b7056ff4b595a8675cd73a9a11ab653e.flv');

flv.on('info',msg=>{
  // console.log('info',msg);
  
})

flv.on('sync',msg=>{
  // console.log('sync',msg);
})


