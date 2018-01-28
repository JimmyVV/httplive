import AVFLV from '../src/webpack-worker';


let flv = new AVFLV({
  video:document.getElementById('videoTag')
});


flv.send('http://6721.liveplay.myqcloud.com/live/6721_5e2d49f13faecef438914759e15d4c8f.flv');

setTimeout(() => {
  // flv.player.retry();
  // flv.player.replace('http://6721.liveplay.myqcloud.com/live/6721_02b476b9814b8442ff3bddd4dd64804e.flv');
}, 2000);