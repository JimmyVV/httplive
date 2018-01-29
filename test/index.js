// import AVFLV from '../src/webpack-worker';
import AVFLV from '../src';
import { log } from 'util';

let video = document.getElementById('videoTag');

let flv = new AVFLV({
  video
});

video.addEventListener('canplaythrough',()=>{
  video.play();
},false);

video.addEventListener('error',e=>{
  throw new Error(e);
},false);


flv.send('http://6721.liveplay.myqcloud.com/live/6721_5e3c6119e565aee3024e859508d5b4a1.flv');

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