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

video.addEventListener('error',e=>{
  throw new Error(e);
},false);




flv.on('info',msg=>{
  // console.log('info',msg);
  
})

flv.on('sync',msg=>{
  // console.log('sync',msg);
})

let playBtn = document.getElementById('start-player');


let connectLive = true;

playBtn.addEventListener('click',e=>{

  connectLive && (()=>{
    flv.send('http://6721.liveplay.myqcloud.com/live/6721_bf2e61b30449c8bf8a2d58cefe3d928a.flv');
    video.play();

  })();

  connectLive = false;

},false);


