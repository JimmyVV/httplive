import HTTPLive from '../dist/index.worker.min.js';
// import HTTPLive from '../src/webpack-worker/index';
// import {CustomPlayer,HTTPChunked} from '../dist/index.min.js';
import {
  log
} from 'util';

let video = document.getElementById('videoTag');

// const HTTPLive = CustomPlayer({
//   HTTPChunked
// });

let flv = new HTTPLive({
  video,
  request: {
    cors: "cors"
  }
});

video.addEventListener('error', e => {
  throw new Error(e);
}, false);




flv.on('info', msg => {
  // console.log('info',msg);

})

flv.on('sync', msg => {
  // console.log('sync',msg);
})

let playBtn = document.getElementById('start-player');

let inputText = document.getElementById('httpUrl');

var httpUrl;

inputText.addEventListener('change', e => {
  httpUrl = e.target.value;
})


let connectLive = true;

playBtn.addEventListener('click', e => {


  if (httpUrl) {

    connectLive && (() => {
      flv.send(httpUrl);
      video.play();

    })();

    connectLive = false;
  }else{
    alert('请输入连接');
  }


}, false);