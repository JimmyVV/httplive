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


flv.send('http://6721.liveplay.myqcloud.com/live/6721_d857900880ff24ea994d7bb3fa84e979.flv');

flv.on('info',msg=>{
  // console.log('info',msg);
  
})

flv.on('sync',msg=>{
  // console.log('sync',msg);
})



// setTimeout(() => {
//   // flv.player.retry();
//   // flv.player.replace('http://6721.liveplay.myqcloud.com/live/6721_02b476b9814b8442ff3bddd4dd64804e.flv');
// }, 2000);