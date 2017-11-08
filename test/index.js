import HTTPFLV from '../src';


fetch('http://6721.liveplay.myqcloud.com/live/6721_9febdbfed5af9a2c5af765d9a23609b7.flv')
.then(res=>{
    var text = '';
    var reader = res.body.getReader()
    var decoder = new TextDecoder();
    
    return readChunk();
  
    function readChunk() {
      return reader.read().then(appendChunks);
    }
  
    function appendChunks(result) {
      var chunk = decoder.decode(result.value || new Uint8Array, {stream: !result.done});
      console.log('got chunk of', chunk.length, 'bytes')
      text += chunk;
      console.log('text so far is', text.length, 'bytes\n');
      if (result.done) {
        console.log('returning')
        return text;
      } else {
        console.log('recursing')
        return readChunk();
      }
    }
})