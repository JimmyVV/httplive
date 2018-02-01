<div align="center">
  <a href="https://github.com/JimmyVV/httplive">
    <img width="300" heigth="300" src="http://villainhr-1252111119.file.myqcloud.com/Screen%20Shot%202018-02-01%20at%201.13.35%20PM.png">
  </a>
  <br>
  <br>

</div>


## 简介

在 MSE 技术逐渐得到各大浏览器的认可时，前端音视频能力也得到了极大的提升。80% 以上的浏览器都已经支持，而且，对于 X5 系浏览器，将会在 2018 年初加上对 MSE 的底层支持。`httplive` 借助于 MSE，实现了 httpflv 直播流的播放。不过，它并不仅仅局限于此，其基于 Loaders 的基本思想，实现各个模块的解耦和封装，只要遵循相关的标准，完全可以定制出自己的播放器。这也是该库的思想：


> httplive 并不是库，它只是一套前端直播流的规范。


## 特性

 - 可定制化
 - 追帧策略
 - 高效率音视频同步算法
 - 易上手

## 安装

```
npm install httplive --save
```


## 快速上手

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

如果你想使用自定的模块来代替现有的，定制化自己的 Player，可以参考下面代码：

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

后面，在 wiki 里给出各个模块之间的标准协议。

## 文档

[api.md](./docs)

更详细的文档，可以参考 [wiki](https://github.com/JimmyVV/httplive/wiki/Get-Started);

## 联系

如果你对前端 MSE 开发和直播开发感兴趣，可以用微信扫描下面的二维码加入我们。

![wechat](http://villainhr-1252111119.file.myqcloud.com/qrcode_for_gh_ac06a91faa8b_344.jpg)

回复 `MSE`，你会得到另外一个最新 group QR_code，扫描并加入我们吧。

对于没有微信的开发者，可以直接发送 [email](mailto:villainthr@gmail.com) ，相互学习。

 - villainthr@gmail.com

 如果你对 httplive 有疑问，可以直接提 [issue](https://github.com/JimmyVV/httplive/issues/new) 表述你的问题。Httplive 是一个开源项目，非常欢迎大家对现有代码进行改进和优化，贡献 [PR](https://github.com/JimmyVV/httplive/pulls)


## LICENSE

httplive is under the Apache License. See the LICENSE file for details. 


