exports.download = function (mp4) {
	let blob = new Blob(mp4, {
		// type: 'video/mp4'
		type: 'application/octet-binary'
	});
	var url = window.URL.createObjectURL(blob);
	var a = document.createElement('a');
	a.style.display = 'none';
	a.href = url;
	a.download = 'test.mp4';
	document.body.appendChild(a);
	a.click();
	setTimeout(function () {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}, 100);
}

exports.downfile = function (buffer, type) {
	let mp4 = new File([buffer], 'ce.mp4', {
		type: 'video/mp4'
	});
	let url = window.URL.createObjectURL(mp4);
	let a = document.createElement('a');
	a.style.display = 'none';
	a.href = url;
	a.download = type + '.mp4';
	document.body.appendChild(a);
	a.click();
	setTimeout(function () {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}, 100);
}

exports.downFLV= function (buffer, type) {
	let mp4 = new File([buffer], 'ce.flv', {
		type: 'video/x-flv'
	});
	let url = window.URL.createObjectURL(mp4);
	let a = document.createElement('a');
	a.style.display = 'none';
	a.href = url;
	a.download = type + '.flv';
	document.body.appendChild(a);
	a.click();
	setTimeout(function () {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}, 100);
}

exports.downAudio = function (buffer) {
	let mp4 = new File([buffer], 'ce.mpeg', {
		type: 'audio/mpeg'
	});
	let url = window.URL.createObjectURL(mp4);
	let a = document.createElement('a');
	a.style.display = 'none';
	a.href = url;
	a.download = 'test.mp3';
	document.body.appendChild(a);
	a.click();
	setTimeout(function () {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}, 100);
}

/**
 * @param {Buffer} param: more than one params to create a combined buffer
 */
exports.mergebox = function () {
	let boxes = Array.prototype.slice.call(arguments);

	let boxLength = boxes.reduce((pre, val) => {
		return pre + val.byteLength;
	}, 0);

	let buffer = new Uint8Array(boxLength);

	let offset = 0;

	boxes.forEach(box => {
		box = new Uint8Array(box);
		buffer.set(box, offset);
		offset += box.byteLength;
	});

	return buffer;
}

/**
 * combine buffer and download its MIME type like mp4
 */
exports.concatBuffer = (function () {
	let buffer = new ArrayBuffer(0);
	let _this = exports;
	return function (segment,length) {
		buffer = _this.mergebox(buffer,segment.buffer);
		
		if(buffer.byteLength > length) _this.downfile(buffer,'video');
	}
})()


exports.stop = (function(){
	let num = 0;

	return function(limit){

		return limit <= num++;
	}


})();
