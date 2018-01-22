function consume(reader) {
    var total = 0
    return pump()
    function pump() {
      return reader.read().then(({done, value}) => {
        if (done) {
          return
        }
        total += value.byteLength
        log(`received ${value.byteLength} bytes (${total} bytes in total)`)
        return pump()
      })
      .catch(err=>{
          console.error(err);
      })
    }
  }
  
  fetch("http://6721.liveplay.myqcloud.com/live/6721_6e049448d227b9f2fb951a2a5f2ca3cb.flv")
    .then(res => consume(res.body.getReader()))
    .then(() => log("consumed the entire body without keeping the whole thing in memory!"))
    .catch(e => log("something went wrong: " + e))