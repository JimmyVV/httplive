In order to reduce the size, httplive provides you two min.js, one is using webworker, the other is not.

If you are using webpack as a build tool, you can simply switch between them.

```
resolve:{
    alias:{
        httplive:path.resolve(__dirname,'node_modules/httplive/dist/index.min.js'),
        workerlive:path.resolve(__dirname,'node_modules/httplive/dist/index.worker.min.js'),
    }
}
```

And, their interface is the same.

### httplive

```
import HTTPLive from 'httplive';
```

### Construtor

Its constructor is:

```
[Constructor]
interface HTTPLive(params)

[Parameter]
Object params{
    attribute HTMLElement video;[necessary]
    attribute String      url;
    attribute Object      mse;
    attribute Object      request;
}

[SubParameter]
Object mse{
    attribute Number    maxBufferTime, 60;
    attribute Number    trailedTime, 2;
    attribute Boolean   keepUpdated, true;
    attribute Number    playbackRate, 1.5;
}
```

For above params, only the video is necessary. 

 - video: The video element you want to bind with [MSE](https://www.w3.org/TR/media-source/#).
 - url: the link of live video
 - mse: some params to control the MSE
    - maxBufferTime: the maximum playing time to remove timeRanges
    - keepUpdated: indicate to catch up time when the video time behind the ranges.end(0)
    - trailedTime: the maximum delay time of video behind the ranges.end(0), otherwise, the play will use fast forward to catch up live time. 
    - playbackRate: the fast forward rate when to catch up time.

you can simply use:

```
let video = document.getElementById('video');
let flv = new HTTPLive({
        video
    });

// if you wanna pass some params,you can use:

let flv = new HTTPLive({
    video,
    mse:{
        keepUpdated: false
    }
});
```


### Initialization

```
[Return]
interface HTTPLive(params){
    void send(String url);
    void retry();
    EventListener on(event,fn);
    EventListener bind(event,fn);
    EventListener addEventListener(event,fn);
    
    static boolean isSupported();
}

enum event{
    info,
    sync
}
```

 - send(url): when you start to recevice the live video chunk, you can call this fn. but remember that, you can only trigger this fn once.
 - retry(): provide you a way to retry the connection.
 - on/bind/addEventListener(): just add some listener to get some valuable messages.
 - isSupported: check if the browser support MSE.
