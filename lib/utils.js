export const mergeBuffer = (...buffers) => {
    // buffers are arrayBuffer
    let boxLength = buffers.reduce((pre, val) => {
        return pre + val.byteLength;
    }, 0);

    let buffer = new Uint8Array(boxLength);

    let offset = 0;
    
    buffers.forEach(box => {
        buffer.set(new Uint8Array(box), offset);
        offset += box.byteLength;
    });


    return buffer.buffer;
}

// get Unit8Array
// return Unit8Array
export const mergeTypedArray = (...buffers) => {
    // buffers are arrayBuffer
    let boxLength = buffers.reduce((pre, val) => {
        return pre + val.byteLength;
    }, 0);

    let buffer = new Uint8Array(boxLength);

    let offset = 0;
    
    buffers.forEach(box => {
        buffer.set(box, offset);
        offset += box.byteLength;
    });


    return buffer;
}

