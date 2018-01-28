import AVFLV from '../src';


let flv = new AVFLV({
  video:document.getElementById('videoTag')
});


flv.send('http://6721.liveplay.myqcloud.com/live/6721_094d5639a535afc5f90ed4fe55ed3140.flv');
