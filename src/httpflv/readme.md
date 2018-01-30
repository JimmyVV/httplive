
### Construtor

```
[Constructor]
interface HTTPChunked(String url, Object config);


[Parameter] String url;

[Parameter] 
Object config{
    attribute Boolean withCredentials, true;
    attribute Number timeout, 0;
    attribute String cors, "cors";
}

```

Firstly, if your url is cross-origin, you can pass `withCredentials` and `cors` to indicate that is CORS request. The default parameters is CORS params.

```
let chunked = new HTTPChunked({
    withCredentials:true,
    cors:"cors",
});
```

### Initialization

```
[Return]
interface HTTPChunked{
    void send(String url);
    void retry();
    void drop();
    EventListener on(event,fn);
    EventListener bind(event,fn);
    EventListener addEventListener(event,fn);
}

enum event{
    stream,
    chunk,
    end,
    error
}
```

When you want to connect live video url, just call send(url):

```
let chunked = new HTTPChunked({
    withCredentials:true,
    cors:"cors",
});

chunked.send('https://xxxxxxxflv');
``` 

But if you want to process the flv chunks, you can listen on stream and chunk Event.

```
chunked.on('chunk',(chunk)=>{
    // the raw data from the sever before been pared
});

chunked.on('stream',(stream,type)=>{
     // after been decoded, it will return stream[chunkArray] which has already been distinguished by `IS` and `MS`
});

chunked.send('https://xxxxxxxflv');
``` 

The callback constructor is:

```
[EventListener]
EventName chunk{
    attribute ArrayBuffer chunk
}

EventName stream{
    attribute Array stream;
    attribute String type;
}
```

 - type: indicates which type of this streamArray is. `IS` || `MS`

```
if type is 'IS'
    // the stream always contains video and audio
    stream = [
        {
            attribute ArrayBuffer buffer;
            attribute Object info:{
                // the following is for 'header'
                attribute String type;
                attribute String desc;
                attribute Number version;
                attribute Number tagOffset;
                attribute Boolean hasAudio;
                attribute Boolean hasVideo;

                // the following is for 'body'
                attribute Number dataOffset;
                attribute Number dataSize;
                attribute Number timeStamp;
                attribute Number tagLen;
            }
        },
        ...
    ]
else if type is 'MS'
    stream = [
        {
            attribute ArrayBuffer buffer;
            attribute Object info:{
                attribute String type;
                attribute String desc;
                attribute Number dataOffset;
                attribute Number dataSize;
                attribute Number timeStamp;
                attribute Number tagLen;
            }
        },
        ...
    ]
```

 - type: Indicates type of the tag, like: "header","video","audio","script".
 - desc: Distinguish these tags into MS and IS type. like: "header","body".












