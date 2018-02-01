考虑到使用场景的不同，`httplive` 提供两个完整的 `min.js`。一个是针对于 webworker，另外一个是直接在 Document 上运行。如果你项目的构建工具是 webpack，你可以很容易的替换两者。

```
resolve:{
    alias:{
        httplive:path.resolve(__dirname,'node_modules/httplive/dist/index.min.js'),
        workerlive:path.resolve(__dirname,'node_modules/httplive/dist/index.worker.min.js'),
    }
}
```

或者，你可以通过路径来区分引用：

```
// no-worker
import HTTPLive from 'httplive';

// worker
import HTTPLive from 'httplive/dist/index.worker.min';
```

不管你引入哪一个，它们的接口都是一样的：

## 调用

```
import HTTPLive from 'httplive';
```

### 构造函数

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

上面的入参中，只有 `video` 是必须的。

 - video: 你与 [MSE](https://www.w3.org/TR/media-source/#) 绑定的 video 元素
 - url: 直播链接，其能够提供 chunked 的长连接协议.
 - mse: 用来控制 MSE 播放的参数
    - maxBufferTime: timeRanges 最大的清除时间
    - keepUpdated: 当 video 的播放时间晚于 ranges.end(0) 时，是否开启追帧策略(变速播放)
    - trailedTime: video 播放时间落后与 ranges.end(0) 的最大范围值
    - playbackRate: 追帧策略的变速比例

如果为了更好的体验，你可以取消追帧策略。

```
let video = document.getElementById('video');
let flv = new HTTPLive({
        video
    });

let flv = new HTTPLive({
    video,
    mse:{
        keepUpdated: false
    }
});
```


### 实例返回

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


 - send(url): 当开始播放直播流时，可以调用该方法。不过，你只能调用一次。
 - retry(): 提供重试操作。
 - on/bind/addEventListener(): 监听事件方法。
 - isSupported(): 检查你的浏览器，是否能正常播放直播流。 


### 事件


Httplive 提供了 `sync` 和 `info` 两个事件。你可以得到直播流的 Initialization 信息和 A/V 同步的播放信息。

```
flv.on('info',msg=>{
    window.__report({
        mediaInfo
        videoMime
        audioMime
    });
  
    window.__report("The video size, width: " + mediaInfo.width + " height: " + mediaInfo.height);
})

flv.on('sync',msg=>{
    let {diffTimebase,audioTimebase,videoTimeStamp} = msg;
    
    if(diffTimebase > 100){
        // videoTime is 100ms faster than audio
    }else{
        // A/V is sync
    }
})
```

`info` 事件的内容有：

```
Event info{
    attribute Object mediaInfo；
    attribute String videoMime;
    attribute String audioMime;
}

Object mediaInfo{
    attribute Number audiocodecid:
    attribute Number audiodatarate
    attribute Number audiosamplerate
    attribute Number audiosamplesize
    attribute Number duration
    attribute String encoder
    attribute Number filesize
    attribute Number height
    attribute Boolean stereo
    attribute Number videocodecid
    attribute Number videodatarate
    attribute Number width
    attribute Boolean hasVideo
    attribute Boolean hasAudio
}
```

`sync` 事件的内容有：

```
Event sync{
        attribute Number videoTimebase;
        attribute Number audioTimebase;
        attribute Number diffTimebase;
        attribute Number videoTimeStamp;
        attribute Number audioTimeStamp;
}
```
