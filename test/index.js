import AVFLV from '../src';


let flv = new AVFLV({
  video:document.getElementById('videoTag')
});


flv.send('http://6721.liveplay.myqcloud.com/live/6721_947f66d8b5a03e2466833e06d1a22c91.flv');

setTimeout(() => {
  // flv.player.retry();
  // flv.player.replace('http://6721.liveplay.myqcloud.com/live/6721_02b476b9814b8442ff3bddd4dd64804e.flv');
}, 2000);