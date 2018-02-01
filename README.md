![httplive](http://villainhr-1252111119.file.myqcloud.com/create_thumb.png)

## Introduction

When the MSE technology is accepted by most of browser, front-end developers can do much more multimedia things. And now, more than 80% browser has supported it. In China, X5, the largest market share of the kernel, will support it in early 2018. `httplive` achieves live stream playback of httpflv protocol depending on MSE. Based on the loaders idea, it decouples and encapsulates modules in `httpflv`, like HttpChunked, MuxController, MSEController. If you want to customize you owner player, you just need to simply follow the relevant standards. And this is the main idea:

> httplive is not a library, but a standards of front-end live stream playback


## Features

 - Customization
 - Playrate playback
 - High effective A/V sync algorithm
 - Easily
 
 ## Install

```
npm install httplive --save
```

## Get Started

```
import HTTPLive from 'httplive';

let video = document.getElementById('videoTag');

let flv = new HTTPLive({
  video
});

video.addEventListener('canplaythrough',()=>{
  video.play();
},false);

flv.send('https://xxx.flv');
```

If you want to use custom modules to replace existing modules, you can simply do like this:

```
import {CustomPlayer} from 'httplive';
import WebSocketChunked from 'custom';

// Replace HTTPChunked module by WebSocketChunked. 

const HTTPLive = CustomPlayer({
    HTTPChunked: WebSocketChunked
});

let flv = new HTTPLive({
  video
});
...

```

Later, I will show you about the standard protocols of these modules. 

## API

[api.md](./docs)

You can reference more detailed document to [wiki](https://github.com/JimmyVV/httplive/wiki/Get-Started);

## Contact

If you are interested in MSE and live stream playback, you can scan the QR_code and join us.

![wechat](http://villainhr-1252111119.file.myqcloud.com/qrcode_for_gh_ac06a91faa8b_344.jpg)

Then, replay `MSE`, you can get a group QR_code. Scan it and Welcome.


## LICENSE

httplive is under the Apache License. See the LICENSE file for details. 




