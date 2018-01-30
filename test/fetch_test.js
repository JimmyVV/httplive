// import HTTPLive from '../src/webpack-worker';
import {CustomPlayer} from '../src';
import { log } from 'util';

let video = document.getElementById('videoTag');

const HTTPLive = CustomPlayer();


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


flv.send('http://6721.liveplay.myqcloud.com/live/6721_f8137a92b0438238aa971db5962bafd2.flv');

flv.on('info',msg=>{
  console.log('info',msg);
})

flv.on('sync',msg=>{
  console.log('sync',msg);
})



setTimeout(() => {
  // flv.player.retry();
  // flv.player.replace('http://6721.liveplay.myqcloud.com/live/6721_02b476b9814b8442ff3bddd4dd64804e.flv');
}, 2000);