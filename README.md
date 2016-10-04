<a name="FileAPI"></a>
## FileAPI <img src="https://api.travis-ci.org/mailru/FileAPI.png?branch=master"/>
一套文件的JavaScript工具.

<a name="started"></a>
### 开始

从中下载文件 [dist](https://github.com/mailru/FileAPI/tree/master/dist) directory, and then:

```html
	<div>
		<!-- "js-fileapi-wrapper" -- required class -->
		<div class="js-fileapi-wrapper upload-btn">
			<div class="upload-btn__txt">Choose files</div>
			<input id="choose" name="files" type="file" multiple />
		</div>
		<div id="images"><!-- previews --></div>
	</div>

	<script>window.FileAPI = { staticPath: '/js/FileAPI/dist/' };</script>
	<script src="/js/FileAPI/dist/FileAPI.min.js"></script>
	<script>
		var choose = document.getElementById('choose');
		FileAPI.event.on(choose, 'change', function (evt){
			var files = FileAPI.getFiles(evt); // 检索文件列表

			FileAPI.filterFiles(files, function (file, info/**Object*/){
				if( /^image/.test(file.type) ){
					return	info.width >= 320 && info.height >= 240;
				}
				return	false;
			}, function (files/**Array*/, rejected/**Array*/){
				if( files.length ){
					//生成预览 100x100
					FileAPI.each(files, function (file){
						FileAPI.Image(file).preview(100).get(function (err, img){
							images.appendChild(img);
						});
					});

					// 上传文件
					FileAPI.upload({
						url: './ctrl.php',
						files: { images: files },
						progress: function (evt){ /* ... */ },
						complete: function (err, xhr){ /* ... */ }
					});
				}
			});
		});
	</script>
```

---

<a name="FileAPI.setup"></a>
### Setup options
编辑文件`crossdomain.xml`，并将其放置到文件将被上传域的根。

```html
	<script>
		window.FileAPI = {
			  debug: false   // 调试模式，见控制台
			, cors: false    // 如果使用CORS，集 `true`
			, media: false   // 如果使用的摄像头，设置 `true`
			, staticPath: '/js/FileAPI/dist/' // 路径 '*.swf'
			, postNameConcat: function (name, idx){
				// Default: object[foo]=1&object[bar][baz]=2
				// .NET: https://github.com/mailru/FileAPI/issues/121#issuecomment-24590395
				return	name + (idx != null ? '['+ idx +']' : '');
			}
		};
	</script>
	<script src="/js/FileAPI/dist/FileAPI.min.js"></script>

	<!-- OR -->

	<script>
		window.FileAPI = { /* options */ };
		require(['FileAPI'], function (FileAPI){
			// ...
		});
	</script>
```

---


<a name="FileAPI.getFiles"></a>
### getFiles(input`:HTMLInputElement|Event|$.Event`)`:Array`
检索`input`元素或`event`对象的文件列表，还支持`jQuery`。

* input — `HTMLInputElement`, `change` and `drop` event, `jQuery` collection or `jQuery.Event`

```js
var el = document.getElement('my-input');
FileAPI.event.on(el, 'change', function (evt/**Event*/){
	//获取文件列表
	var files = FileAPI.getFiles(el);

	// 或事件
	var files = FileAPI.getFiles(evt);
});
```

---


<a name="FileAPI.getInfo"></a>
### getInfo(file`:Object`, callback`:Function`)`:void`
Get info of file (see also: FileAPI.addInfoReader).

* file — file object (https://developer.mozilla.org/en-US/docs/DOM/File)
* callback — function, called after collected info of file

```js
// 得到图像文件信息（fileapi.exif.js在内）
FileAPI.getInfo(file, function (err/**String*/, info/**Object*/){
	if( !err ){
		console.log(info); // { width: 800, height: 600, exif: {..} }
	}
});

// 获取MP3文件信息（fileapi.id3.js在内）
FileAPI.getInfo(file, function (err/**String*/, info/**Object*/){
	if( !err ){
		console.log(info); // { title: "...", album: "...", artists: "...", ... }
	}
});
```

---

<a name="FileAPI.filterFiles"></a>
### filterFiles(files`:Array`, filter`:Function`, callback`:Function`)`:void`
过滤的文件列表，以及有关文件的其他信息。
另请参见：文件API.get信息和文件API.add信息阅读器.

* files — 原始文件列表
* filter — function, takes two arguments: `file` — the file itself, `info` — 附加信息.
* callback — function: `list` — files that match the condition, `other` — 所有的休息.

```js
// 获取文件列表
var files = FileAPI.getFiles(input);

// 过滤列表
FileAPI.filterFiles(files, function (file/**Object*/, info/**Object*/){
	if( /^image/.test(file.type) && info ){
		return	info.width > 320 && info.height > 240;
	} else {
		return	file.size < 20 * FileAPI.MB;
	}
}, function (list/**Array*/, other/**Array*/){
	if( list.length ){
		// ..
	}
});
```

---

<a name="FileAPI.getDropFiles"></a>
### getDropFiles(evt`:Event|$.Event`, callback`:Function`)`:void`
获取文件的列表，包括目录.

* evt — `drop` event
* callback — function, takes one argument, a list of files

```js
FileAPI.event.on(document, 'drop', function (evt/**Event*/){
	evt.preventDefault();

	//获取文件列表
	FileAPI.getDropFiles(evt, function (files/**Array*/){
		// ...
	});
});
```

---

<a name="FileAPI.upload"></a>
### upload(opts`:Object`)`:XmlHttpRequest`
上传文件到服务器（先后）。返回XHR状物品。
要记住工作正常闪存传输服务器响应体不能为空是很重要的，
例如，你可以传递，只是文本 "ok".

* opts — options object, see [Upload options](#options)

```js
var el = document.getElementById('my-input');
FileAPI.event.on(el, 'change', function (evt/**Event*/){
	var files = FileAPI.getFiles(evt);
	var xhr = FileAPI.upload({
		url: 'http://rubaxa.org/FileAPI/server/ctrl.php',
		files: { file: files[0] },
		complete: function (err, xhr){
			if( !err ){
				var result = xhr.responseText;
				// ...
			}
		}
	});
});
```

---

<a name="FileAPI.addInfoReader"></a>
### addInfoReader(mime`:RegExp`, handler`:Function`)`:void`
增加对有关文件的信息的收集处理程序。
另请参见：文件API.getInfo和文件API.filter文件.

* mime — pattern of mime-type
* handler — takes two arguments: `file` object and `complete` function callback

```js
FileAPI.addInfoReader(/^image/, function (file/**File*/, callback/**Function*/){
	// http://www.nihilogic.dk/labs/exif/exif.js
	// http://www.nihilogic.dk/labs/binaryajax/binaryajax.js
	FileAPI.readAsBinaryString(file, function (evt/**Object*/){
		if( evt.type == 'load' ){
			var binaryString = evt.result;
			var oFile = new BinaryFile(binaryString, 0, file.size);
			var exif  = EXIF.readFromBinaryFile(oFile);
			callback(false, { 'exif': exif || {} });
		}
		else if( evt.type == 'error' ){
			callback('read_as_binary_string');
		}
		else if( evt.type == 'progress' ){
			// ...
		}
	});
});
```

---

<a name="FileAPI.readAsDataURL"></a>
### readAsDataURL(file`:Object`, callback`:Function`)`:void`
读取指定`File`的内容作为`数据URL`。

* file — file object
* callback — function, receives a result

```js
FileAPI.readAsDataURL(file, function (evt/**Object*/){
	if( evt.type == 'load' ){
		// Success
	 	var dataURL = evt.result;
	} else if( evt.type =='progress' ){
		var pr = evt.loaded/evt.total * 100;
	} else {
		// Error
	}
})
```

---

<a name="FileAPI.readAsBinaryString"></a>
### readAsBinaryString(file`:Object`, callback`:Function`)`:void`
读取指定`File`的内容作为`BinaryString`(二进制字符串)。

* file — file object
* callback — function, receives a result

```js
FileAPI.readAsBinaryString(file, function (evt/**Object*/){
	if( evt.type == 'load' ){
		// Success
	 	var binaryString = evt.result;
	} else if( evt.type =='progress' ){
		var pr = evt.loaded/evt.total * 100;
	} else {
		// Error
	}
})
```

---

<a name="FileAPI.readAsArrayBuffer"></a>
### readAsArrayBuffer(file`:Object`, callback`:Function`)`:void`
读取指定`File`的内容作为`ArrayBuffer`(数组缓冲区)。

* file — file object
* callback — function, receives a result

```js
FileAPI.readAsArrayBuffer(file, function (evt/**Object*/){
	if( evt.type == 'load' ){
		// Success
	 	var arrayBuffer = evt.result;
	} else if( evt.type =='progress' ){
		var pr = evt.loaded/evt.total * 100;
	} else {
		// Error
	}
})
```

---

<a name="FileAPI.readAsText"></a>
### readAsText(file`:Object`, callback`:Function`)`:void`
读取指定`File`的内容作为`text`。

* file — file object
* callback — function, receives a result

```js
FileAPI.readAsText(file, function (evt/**Object*/){
	if( evt.type == 'load' ){
		// Success
	 	var text = evt.result;
	} else if( evt.type =='progress' ){
		var pr = evt.loaded/evt.total * 100;
	} else {
		// Error
	}
})
```

---

<a name="FileAPI.readAsText-encoding"></a>
### readAsText(file`:Object`, encoding`:String`, callback`:Function`)`:void`
读取指定的内容 `File` 如 `text`.

* 编码 - 指示的编码以用于返回的数据的字符串。 默认， UTF-8.

```js
FileAPI.readAsText(file, "utf-8", function (evt/**Object*/){
	if( evt.type == 'load' ){
		// Success
	 	var text = evt.result;
	} else if( evt.type =='progress' ){
		var pr = evt.loaded/evt.total * 100;
	} else {
		// Error
	}
})
```

---


<a name="options" data-name="Upload options"></a>
## 上传选项

<a name="options.url"></a>
### url`:String`
要将请求发送一个包含URL字符串.

---

<a name="options.data"></a>
### data`:Object`
要随着文件上传发送附加后的数据.

```js
var xhr = FileAPI.upload({
	url: '...',
	data: { 'session-id': 123 },
	files: { ... },
});
```

---

<a name="options.headers"></a>
### headers`:Object`
其他请求头中，只有HTML5.

```js
var xhr = FileAPI.upload({
	url: '...',
	headers: { 'x-upload': 'fileapi' },
	files: { .. },
});
```

---

<a name="options.files"></a>
### files`:Object`
Key-value object, `key` — post name, `value` — File or FileAPI.Image object.


```js
var xhr = FileAPI.upload({
	url: '...',
	files: {
		audio: files
	}
});
```

---

<a name="options.chunkSize"></a>
### chunkSize`:Number`
以字节为单位的块大小，只有HTML5.

```js
var xhr = FileAPI.upload({
	url: '...',
	files: { images: fileList },
	chunkSize: 0.5 * FileAPI.MB
});
```

---

<a name="options.chunkUploadRetry"></a>
### chunkUploadRetry`:Number`
重试期间上传块数，只有HTML5.

```js
var xhr = FileAPI.upload({
	url: '...',
	files: { images: fileList },
	chunkSize: 0.5 * FileAPI.MB,
	chunkUploadRetry: 3
});
```

--

<a name="options.imageTransform"></a>
### imageTransform`:Object`
变化的规则的客户端上的原始图像。

```js
var xhr = FileAPI.upload({
	url: '...',
	files: { image: imageFiles },
	//改变原始图像
	imageTransform: {
		// 由Max边调整
		maxWidth: 800,
		maxHeight: 600,
		// 加水印
		overlay: [{ x: 10, y: 10, src: '/i/watemark.png', rel: FileAPI.Image.RIGHT_BOTTOM }]
	}
});
```

--

<a name="options.imageTransform-multi"></a>
### imageTransform`:Object`
在客户端，为更多的图像在图像变换规则.

```js
var xhr = FileAPI.upload({
	url: '...',
	files: { image: imageFiles },
	imageTransform: {
		// resize by max side
		'huge': { maxWidth: 800, maxHeight: 600 },
		// crop & resize
		'medium': { width: 320, height: 240, preview: true },
		// crop & resize + watemark
		'small': {
			width: 100, height: 100,
			// Add watermark
			overlay: [{ x: 5, y: 5, src: '/i/watemark.png', rel: FileAPI.Image.RIGHT_BOTTOM }]
		}
	}
});
```

--

<a name="options.imageTransform-jpeg"></a>
### imageTransform`:Object`
转换所有图像，JPEG或PNG.

```js
var xhr = FileAPI.upload({
	url: '...',
	files: { image: imageFiles },
	imageTransform: {
		type: 'image/jpeg',
		quality: 0.86 // jpeg quality
	}
});
```


<a name="options.imageOriginal"></a>
### imageOriginal`:Boolean`
发送到服务器原始图像与否，如果确定图像变换选项。

--

<a name="options.imageAutoOrientation"></a>
### imageAutoOrientation`:Boolean`
Auto-rotate images on the basis of EXIF.

--

<a name="options.prepare"></a>
### prepare`:Function`
准备上传特定文件的选项。

```js
var xhr = FileAPI.upload({
	url: '...',
	files: { .. }
	prepare: function (file/**Object*/, options/**Object*/){
		options.data.secret = utils.getSecretKey(file.name);
	}
});
```

--

<a name="options.upload"></a>
### upload`:Function`
Start uploading.

```js
var xhr = FileAPI.upload({
	url: '...',
	files: { .. }
	upload: function (xhr/**Object*/, options/**Object*/){
		// ...
	}
});
```

--

<a name="options.fileupload"></a>
### fileupload`:Function`
Start file uploading.

```js
var xhr = FileAPI.upload({
	url: '...',
	files: { .. }
	fileupload: function (file/**Object*/, xhr/**Object*/, options/**Object*/){
		// ...
	}
});
```

--

<a name="options.progress"></a>
### progress`:Function`
回调上传进度的事件。

```js
var xhr = FileAPI.upload({
	url: '...',
	files: { .. }
	progress: function (evt/**Object*/, file/**Object*/, xhr/**Object*/, options/**Object*/){
		var pr = evt.loaded/evt.total * 100;
	}
});
```

--

<a name="options.fileprogress"></a>
### fileprogress`:Function`
回调上传文件进度事件。

```js
var xhr = FileAPI.upload({
	url: '...',
	files: { .. }
	fileprogress: function (evt/**Object*/, file/**Object*/, xhr/**Object*/, options/**Object*/){
		var pr = evt.loaded/evt.total * 100;
	}
});
```

--

<a name="options.complete"></a>
### complete`:Function`
回调结束上传请求。

```js
var xhr = FileAPI.upload({
	url: '...',
	files: { .. }
	complete: function (err/**String*/, xhr/**Object*/, file/**Object/, options/**Object*/){
		if( !err ){
			// All files successfully uploaded.
		}
	}
});
```

--

<a name="options.filecomplete"></a>
### filecomplete`:Function`
回调结束上传请求。

```js
var xhr = FileAPI.upload({
	url: '...',
	files: { .. }
	filecomplete: function (err/**String*/, xhr/**Object*/, file/**Object/, options/**Object*/){
		if( !err ){
			// 文件上传成功
			var result = xhr.responseText;
		}
	}
});
```

---

<a name="File"></a>
## File object

<a name="File.name"></a>
### name
该文件由文件对象引用的名字.

<a name="File.type"></a>
### type
该文件的类型（MIME类型）由File对象引用.

<a name="File.size"></a>
### size
该文件由文件对象引用的大小（字节）.


---


<a name="FileAPI.event"></a>
## FileAPI.event

<a name="FileAPI.event.on"></a>
### on(el`:HTMLElement`, events`:String`, handler`:Function`)`:void`
附加一个事件处理函数.

* el — DOM element
* events — one or more space-separated event types.
* handler — A function to execute when the event is triggered.

---

<a name="FileAPI.event.off"></a>
### off(el`:HTMLElement`, events`:String`, handler`:Function`)`:void`
删除事件处理程序.

* el — DOM element
* events — one or more space-separated event types.
* handler — a handler function previously attached for the event(s).

---

<a name="FileAPI.event.one"></a>
### one(el`:HTMLElement`, events`:String`, handler`:Function`)`:void`
附加一个事件处理函数。该处理器是最多一次执行.

* el — DOM element
* events — one or more space-separated event types.
* handler — a function to execute when the event is triggered.

---

<a name="FileAPI.event.dnd"></a>
### dnd(el`:HTMLElement`, hover`:Function`, handler`:Function`)`:void`
附加拖放事件处理函数.

* el — drop zone
* hover — `dragenter` and `dragleave` listener
* handler — `drop` event handler.

```js
var el = document.getElementById('dropzone');
FileAPI.event.dnd(el, function (over){
	el.style.backgroundColor = over ? '#f60': '';
}, function (files){
	if( files.length ){
		// Upload their.
	}
});

// or jQuery
$('#dropzone').dnd(hoverFn, dropFn);
```

---

<a name="FileAPI.event.dnd.off"></a>
### dnd.off(el`:HTMLElement`, hover`:Function`, handler`:Function`)`:void`
删除拖放事件处理函数.

* el — drop zone
* hover — `dragenter` and `dragleave` listener
* handler — `drop` event handler.

```js
// Native
FileAPI.event.dnd.off(el, hoverFn, dropFn);

// jQuery
$('#dropzone').dndoff(hoverFn, dropFn);
```

--

<a name="FileAPI.Image"></a>
## FileAPI.Image
类处理图像

### constructor(file`:Object`)`:void`
构造函数接受一个参数，则`File`对象。

* file — the `File` object

```js
FileAPI.Image(imageFile).get(function (err/**String*/, img/**HTMLElement*/){
	if( !err ){
		document.body.appendChild( img );
	}
});
```

---

<a name="FileAPI.Image.crop"></a>
### crop(width`:Number`, height`:Number`)`:FileAPI.Image`
Crop image by width and height.

* width — new image width
* height — new image height

```js
FileAPI.Image(imageFile)
	.crop(640, 480)
	.get(function (err/**String*/, img/**HTMLElement*/){

	})
;
```

### crop(x`:Number`, y`:Number`, width`:Number`, height`:Number`)`:FileAPI.Image`
通过X，Y，宽度和高度裁剪图像.

* x — offset from the top corner
* y — offset from the left corner

```js
FileAPI.Image(imageFile)
	.crop(100, 50, 320, 240)
	.get(function (err/**String*/, img/**HTMLElement*/){

	})
;
```

---

<a name="FileAPI.Image.resize"></a>
### resize(width`:Number`, height`:Number`[, strategy`:String`])`:FileAPI.Image`
Resize image.

* width — new image width
* height — new image height
* strategy — enum: `min`, `max`, `preview`, `width`, `height`. By default `undefined`.

```js
FileAPI.Image(imageFile)
	.resize(320, 240)
	.get(function (err/**String*/, img/**HTMLElement*/){

	})
;

// 在我身边调整图像。
FileAPI.Image(imageFile)
	.resize(320, 240, 'max')
	.get(function (err/**String*/, img/**HTMLElement*/){

	})
;

//通过固定高度调整图像。
FileAPI.Image(imageFile)
	.resize(240, 'height')
	.get(function (err/**String*/, img/**HTMLElement*/){

	})
;
```

---

<a name="FileAPI.Image.preview"></a>
### preview(width`:Number`[, height`:Number`])`:FileAPI.Image`
Crop and resize image.

* width — new image width
* height — new image height

```js
FileAPI.Image(imageFile)
	.preview(100, 100)
	.get(function (err/**String*/, img/**HTMLElement*/){

	})
;
```

---

<a name="FileAPI.Image.rotate"></a>
### rotate(deg`:Number`)`:FileAPI.Image`
Rotate image.

* deg — rotation angle in degrees

```js
FileAPI.Image(imageFile)
	.rotate(90)
	.get(function (err/**String*/, img/**HTMLElement*/){

	})
;
```

---

<a name="FileAPI.Image.filter"></a>
### filter(callback`:Function`)`:FileAPI.Image`
Apply filter function. Only `HTML5`.

* callback — takes two arguments, `canvas` element and `done` method.

```js
FileAPI.Image(imageFile)
	.filter(function (canvas/**HTMLCanvasElement*/, doneFn/**Function*/){
		// 等等等等额头
		doneFn();
	})
	.get(function (err/**String*/, img/**HTMLElement*/){

	})
;
```


---

### filter(name`:String`)`:FileAPI.Image`
Uses [CamanJS](http://camanjs.com/), include it before FileAPI library.

* name — CamanJS filter name (custom or preset)

```js
Caman.Filter.register("my-funky-filter", function () {
	// http://camanjs.com/guides/#Extending
});

FileAPI.Image(imageFile)
	.filter("my-funky-filter") // or .filter("vintage")
	.get(function (err/**String*/, img/**HTMLElement*/){

	})
;
```

---

<a name="FileAPI.Image.overlay"></a>
### overlay(images`:Array`)`:FileAPI.Image`
Add overlay images, eg: watermark.

* images — array of overlays

```js
FileAPI.Image(imageFile)
	.overlay([
		// 左下角。
		{ x: 10, y: 10, w: 100, h: 10, src: '/i/watermark.png' },

		//右下角。
		{ x: 10, y: 10, src: '/i/watermark.png', rel: FileAPI.Image.RIGHT_BOTTOM }
	])
	.get(function (err/**String*/, img/**HTMLElement*/){

	})
;
```

---

<a name="FileAPI.Image.get"></a>
### get(fn`:Function`)`:FileAPI.Image`
得到最终的图像。

* fn — complete callback

---

<a name="FileAPI.Camera"></a>
## FileAPI.Camera
要使用一个摄像头的工作，一定要设置 `FileAPI.media: true`.


<a name="FileAPI.Camera.publish"></a>
### publish(el`:HTMLElement`, options`:Object`, callback`:Function`)`:void`
Publication of the camera.

* el — target
* options — { `width: 100%`, `height: 100%`, `start: true` }
* callback — the first parameter is a possible error, the second instance of FileAPI.Camera

```js
var el = document.getElementById('cam');
FileAPI.Camera.publish(el, { width: 320, height: 240 }, function (err, cam/**FileAPI.Camera*/){
	if( !err ){
		//网络摄像头是准备好了，你可以用它.
	}
});
```

---

<a name="FileAPI.Camera.start"></a>
### start(callback`:Function`)`:void`
Turn on the camera.

* callback — will be called when the camera ready

```js
var el = document.getElementById('cam');
FileAPI.Camera.publish(el, { start: false }, function (err, cam/**FileAPI.Camera*/){
	if( !err ){
		// Turn on
		cam.start(function (err){
			if( !err ){
				// The camera is ready for use.
			}
		});
	}
});
```

---

<a name="FileAPI.Camera.stop"></a>
### stop()`:void`
Turn off the camera.

---

<a name="FileAPI.Camera.shot"></a>
### shot()`:FileAPI.Image`
Take a picture with the camera.

```js
var el = document.getElementById('cam');
FileAPI.Camera.publish(el, function (err, cam/**FileAPI.Camera*/){
	if( !err ){
		var shot = cam.shot(); //拍照

		// 创建缩略图100x100
		shot.preview(100).get(function (err, img){
			previews.appendChild(img);
		});

		// 和/或
		FileAPI.upload({
			url: '...',
			files: { cam: shot
		});
	}
});
```

---

<a name="const" data-name="Сonst"></a>
## Сonstants

<a name="FileAPI.KB"></a>
### FileAPI.KB`:Number`
1024 bytes

<a name="FileAPI.MB"></a>
### FileAPI.MB`:Number`
1048576 bytes

<a name="FileAPI.GB"></a>
### FileAPI.GB`:Number`
1073741824 bytes

<a name="FileAPI.TB"></a>
### FileAPI.TB`:Number`
1.0995116e+12 bytes

---

<a name="FileAPI.utils"></a>
## Utils

<a name="FileAPI.each"></a>
### FileAPI.each(obj`:Object|Array`, callback`:Function`[, thisObject`:Mixed`])`:void`
迭代一个对象或数组，执行功能每一个匹配元素.

* obj — array or object
* callback —一个函数来执行对每个元件.
* thisObject — object to use as `this` when executing `callback`.

--

<a name="FileAPI.extend"></a>
### FileAPI.extend(dst`:Object`, src`:Object`)`:Object`
合并两个对象的内容汇集成的第一个对象.

* dst — 一个对象，将获得新的属性
* src — 包含附加属性的对象合并在.

--

<a name="FileAPI.filter"></a>
### FileAPI.filter(array`:Array`, callback`:Function`[, thisObject`:Mixed`)`:Object`
创建与擦肩而过提供的函数实现的测试所有元素的数组.

* array — original Array
* callback — Function to test each element of the array.
* thisObject — object to use as `this` when executing `callback`.

---

<a name="support"><a/>
## Support
<ul>
<li>多文件上传：支持html5或flash所有的浏览器</li>
<li>拖放上传：文件（html5）和目录（铬21+）</li>
<li>分块文件上传（html5）</li>
<li>上传一个文件：所有的浏览器</li>
	<li>
		使用图像: IE6+, FF 3.6+, Chrome 10+, Opera 11.1+, Safari 6+
		<ul>
			<li>裁剪，调整大小，预览和旋转（HTML5或Flash）</li>
			<li>通过EXIF自动定位（HTML5，如果包括文件API.exif.js或Flash）</li>
		</ul>
	</li>
</ul>

<a name="FileAPI.support.html5"></a>
### FileAPI.support.html5`:Boolean`
HTML5 browser support

<a name="FileAPI.support.cors"></a>
### FileAPI.support.cors`:Boolean`
这种跨源资源共享来实现跨站点的HTTP请求.

<a name="FileAPI.support.dnd"></a>
### FileAPI.support.dnd`:Boolean`
拖放事件的支持.

<a name="FileAPI.support.flash"></a>
### FileAPI.support.flash`:Boolean`
可用性Flash插件.

<a name="FileAPI.support.canvas"></a>
### FileAPI.support.canvas`:Boolean`
帆布支持.

<a name="FileAPI.support.dataURI"></a>
### FileAPI.support.dataURI`:Boolean`
支持数据URL作为源文件图像.

<a name="FileAPI.support.chunked"></a>
### FileAPI.support.chunked`:Boolean`
支持分块上传.

---

<a name="flash"></a>
## Flash
Flash是很“buggy”的事情：]
服务器响应不能为空。
因此，在一个成功的上载的情况下的`http status`应该只有`200 OK`。

<a name="flash.settings"></a>
### Settings
闪光灯设置。
明智的做法是把闪存在同一台服务器上所在的文件将被上传.

```html
<script>
	var FileAPI = {
	 	// @default: "./dist/"
		staticPath: '/js/',

		 // @default: FileAPI.staticPath + "FileAPI.flash.swf"
		flashUrl: '/statics/FileAPI.flash.swf',

		// @default: FileAPI.staticPath + "FileAPI.flash.image.swf"
		flashImageUrl: '/statics/FileAPI.flash.image.swf'
	};
</script>
<script src="/js/FileAPI.min.js"></script>
```

---

<a name="crossdomain.xml"></a>
### crossdomain.xml
一定能使服务器上的文件。
不要忘记，以取代你的域名`youdomain.com`。

```xml
<?xml version="1.0"?>
<!DOCTYPE cross-domain-policy SYSTEM "http://www.adobe.com/xml/dtds/cross-domain-policy.dtd">
<cross-domain-policy>
	<site-control permitted-cross-domain-policies="all"/>
	<allow-access-from domain="youdomain.com" secure="false"/>
	<allow-access-from domain="*.youdomain.com" secure="false"/>
	<allow-http-request-headers-from domain="*" headers="*" secure="false"/>
</cross-domain-policy>
```

---

<a name="flash.request"></a>
### request
如果没有指定参数，下面的HTTP POST请求从Flash播放器发送到服务器端脚本:

```xml
POST /server/ctrl.php HTTP/1.1
Accept: text/*
Content-Type: multipart/form-data;
boundary=----------Ij5ae0ae0KM7GI3KM7
User-Agent: Shockwave Flash
Host: www.youdomain.com
Content-Length: 421
Connection: Keep-Alive
Cache-Control: no-cache

------------Ij5GI3GI3ei4GI3ei4KM7GI3KM7KM7
Content-Disposition: form-data; name="Filename"

MyFile.jpg
------------Ij5GI3GI3ei4GI3ei4KM7GI3KM7KM7
Content-Disposition: form-data; name="Filedata"; filename="MyFile.jpg"
Content-Type: application/octet-stream

[[..FILE_DATA_HERE..]]
------------Ij5GI3GI3ei4GI3ei4KM7GI3KM7KM7
Content-Disposition: form-data; name="Upload"

Submit Query
------------Ij5GI3GI3ei4GI3ei4KM7GI3KM7KM7--
```

---

<a name="server"></a>
## Server settings

<a name="server.iframe"></a>
### IFrame/JSONP

```php
<script>
(function (ctx, jsonp){
	'use strict';
	var status = {{httpStatus}}, statusText = "{{httpStatusText}}", response = "{{responseBody}}";
	try {
		ctx[jsonp](status, statusText, response);
	} catch (e){
		var data = "{\"id\":\""+jsonp+"\",\"status\":"+status+",\"statusText\":\""+statusText+"\",\"response\":\""+response.replace(/\"/g, '\\\\\"')+"\"}";
		try {
			ctx.postMessage(data, document.referrer);
		} catch (e){}
	}
})(window.parent, '{{request_param_callback}}');
</script>

<!-- or -->

<?php
	include './FileAPI.class.php';

	if( strtoupper($_SERVER['REQUEST_METHOD']) == 'POST' ){
		// 检索文件列表
		$files	= FileAPI::getFiles();

		// ... your logic

		// JSONP回调名
		$jsonp	= isset($_REQUEST['callback']) ? trim($_REQUEST['callback']) : null;

		//服务器响应: "HTTP/1.1 200 OK"
		FileAPI::makeResponse(array(
			  'status' => FileAPI::OK
			, 'statusText' => 'OK'
			, 'body' => array('count' => sizeof($files))
		), $jsonp);
		exit;
	}
?>
```

---

<a name="server.CORS"></a>
### CORS
Enable CORS.

```php
<?php
	// 允许类型的要求
    header('Access-Control-Allow-Methods: POST, OPTIONS');

    // 说明自定义页眉
    header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Range, Content-Disposition, Content-Type');

    // 用逗号分隔的域名列表
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);

	// 允许缓存
	header('Access-Control-Allow-Credentials: true');

    if( $_SERVER['REQUEST_METHOD'] == 'OPTIONS' ){
        exit;
    }

    if( $_SERVER['REQUEST_METHOD'] == 'POST' ){
        // ...
    }
?>
```

---

<a name="server.chunked"></a>
### Chunked file upload
使用下列HTTP头和状态代码客户机和服务器进行通信，以相互.<br/>
客户明确设置以下头:<br/>
<ul>
	<li>Content-Range: bytes &lt;start-offset&gt;-&lt;end-offset&gt;/&lt;total&gt;</li>
	<li>Content-Disposition: attachment; filename=&lt;file-name&gt;</li>
</ul>
任何其他标头由目标浏览器中设置和不使用的客户端。图书馆不提供任何设施，以跟踪跨请求文件的唯一性，它留在开发商的考虑。<br/>
响应码:
<ul>
<li>200 - 最后一块被上传</li>
<li>201 - 块被成功保存</li>
<li>416 - 范围是不能接受的错误，恢复</li>
<li>500 - 服务器错误，可采</li>
</ul>
对于可恢复的错误服务器尝试重新发送大块大块'chunkUploadRetry`(`上传Retry`)次，然后失败.<br/
Response headers:
<ul>
	<li>的X上次已知字节：INT，库尝试从给定的偏移重新发送数据块。适用于响应代码200和416</li>
</ul>
所有其他代码 - 致命错误，用户参与推荐.

---


<a name="buttons.examples"></a>
## 按钮的例子

<a name="buttons.examples.base"></a>
### Base
Simple input[type="file"]

```html
<span class="js-fileapi-wrapper" style="position: relative; display: inline-block;">
    <input name="files" type="file" multiple/>
</span>
```

---

<a name="buttons.examples.button"></a>
### Button
程式化按钮.

```html
<style>
.upload-btn {
    width: 130px;
    height: 25px;
    overflow: hidden;
    position: relative;
    border: 3px solid #06c;
    border-radius: 5px;
    background: #0cf;

}
    .upload-btn:hover {
        background: #09f;
    }
    .upload-btn__txt {
        z-index: 1;
        position: relative;
        color: #fff;
        font-size: 18px;
        font-family: "Helvetica Neue";
        line-height: 24px;
        text-align: center;
        text-shadow: 0 1px 1px #000;
    }
    .upload-btn input {
        top: -10px;
        right: -40px;
        z-index: 2;
        position: absolute;
        cursor: pointer;
        opacity: 0;
        filter: alpha(opacity=0);
        font-size: 50px;
    }
</style>
<div class="js-fileapi-wrapper upload-btn">
    <div class="upload-btn__txt">上传文件</div>
    <input name="files" type="file" multiple />
</div>
```


---


<a name="buttons.examples.link"></a>
### Link
按钮类似于链接.

```html
<style>
.upload-link {
    color: #36c;
    display: inline-block;
    *zoom: 1;
    *display: inline;
    overflow: hidden;
    position: relative;
    padding-bottom: 2px;
    text-decoration: none;
}
    .upload-link__txt {
        z-index: 1;
        position: relative;
        border-bottom: 1px dotted #36c;
    }
        .upload-link:hover .upload-link__txt {
            color: #f00;
            border-bottom-color: #f00;
        }

    .upload-link input {
        top: -10px;
        right: -40px;
        z-index: 2;
        position: absolute;
        cursor: pointer;
        opacity: 0;
        filter: alpha(opacity=0);
        font-size: 50px;
    }
</style>
<a class="js-fileapi-wrapper upload-link">
    <span class="upload-link__txt">上传图片</span>
    <input name="photo" type="file" accept="image/*" />
</a>
```

---

<a name="install" data-name="Installation"></a>
## 安装，测试，装配
`npm install fileapi`<br/>
`cd fileapi`<br/>
`npm install`<br/>
`grunt`


---


<a name="Changelog"></a>
## Changelog

### 2.0.16-2.0.17
<ul>
	<li>#353: debug mode vs. IE</li>
	<li>#352: correct filename via flash-uploading</li>
</ul>


### 2.0.12-2.0.15 (!)
<ul>
	<li>#346, #342, #344: fixes for XSS into Flash-transport</li>
</ul>


### 2.0.11
<ul>
	<li>#322, #308: dnd & safari + $.fn.dnd (store all dropped items)</li>
	<li>#319: NodeJS tesing</li>
	<li>#317, #313: fixed "malformed entry.name (OSX Unicode NFD)"</li>
	<li>#311: fixed "Arithmetic result exceeded 32 bits"</li>
</ul>


### 2.0.10
<ul>
	<li>#289: * WebCam & html5 == false</li>
	<li>#199, #265: flash fix 2015 error with BitmapData</li>
	<li>#177: IE9, IE11 flash.camera remembered settigns</li>
	<li>#254: check 'onLoadFnName' before call</li>
	<li>#272: fixed `entry.createReader().readEntries`</li>
</ul>


### 2.0.9
<ul>
	<li>#253: fixed `proxyXHR.loaded`</li>
	<li>#250: + check `disabled`-attr</li>
</ul>


### 2.0.8 
<ul>
	<li>Two new resize strategies `width` and `height`</li>
</ul>


### 2.0.7
<ul>
	<li>#214: iframe transport under IE8</li>
	<li>Fixed iframe-transport (remove `disabled`-attr for input)</li>
</ul>


### 2.0.6
<ul>
	<li>#240: Fixed `FileAPI.event.dnd.off`</li>
</ul>


### 2.0.5
<ul>
	<li>+ #228: check callbacks with regexp</li>
	<li>* Updated devDepending</li>
	<li>+ #207: support EXIF.Orientation == 4, 5 & 7 </li>
</ul>


### 2.0.4
<ul>
	<li>+ #176: Add params to the beginning of form</li>
	<li>+ #190: Add 204 as a successful response</li>
	<li>+ #192: many bugfixes; + `retry` & `multipass` options; + QUnit-tests for BigSizeImage</li>
</ul>

### 2.0.3
<ul>
	<li>+ QUnit-tests for iframe-transport</li>
	<li>+ `postMessage` for iframe-transport</li>
	<li>+ `jsonp: "callback"` option</li>
	<li>* resize: `imageTransform.type` rename to `imageTransform.strategy` (!!!)</li>
	<li>+ https://github.com/mailru/FileAPI/pull/165 (#140: fix)</li>
</ul>

### 2.0.2
<ul>
	<li>+ test: upload headers</li>
	<li>+ test: upload + camanjs</li>
	<li>+ test: upload + autoOrientation</li>
	<li>FileAPI.class.php: + HTTP header Content-Type: application/json</li>
	<li>#143: + `FileAPI.flashWebcamUrl` option</li>
	<li>* merge v1.2.7</li>
	<li>+ `FileAPI.formData: true` option</li>
</ul>

### 2.0.1
<ul>
	<li>+ support 'filter' prop in imageTransform</li>
</ul>

### 2.0.0
<ul>
	<li>+ FileAPI.Camera (HTML5 and Flash fallback)</li>
	<li>+ jquery.fileapi.js, see <a href="http://rubaxa.github.io/jquery.fileapi/">demo</a></li>
	<li>+ npm support</li>
	<li>+ grunt support</li>
	<li>+ requirejs support</li>
	<li>+ [#80](https://https://github.com/mailru/FileAPI/issues/80): FileAPI.Image.fn.overlay</li>
 	<li>`imageTransform` — now supports: `crop`, `type`, `quality` and `overlay` properties.</li>
	<li>Improved the documentation</li>
	<li>+iOS fix (https://github.com/blueimp/JavaScript-Load-Image)</li>
	<li>[#121](https://github.com/mailru/FileAPI/issues/121): + FileAPI.`postNameConcat:Function(name, idx)`</li>
	<li>[#116](https://github.com/mailru/FileAPI/issues/116): + `cache:false` option for FileAPI.upload</li>
</ul>


### 1.2.6
<ul>
	<li>[#91](https://github.com/mailru/FileAPI/issues/91): replace `new Image` to `FileAPI.newImage`</li>
	<li>+ FileAPI.withCredentials: true</li>
	<li>[#90](https://github.com/mailru/FileAPI/issues/90): Fixed `progress` event</li>
	<li>[#105](https://github.com/mailru/FileAPI/issues/105): Fixed `image/jpg` -> `image/jpeg`</li>
	<li>[#108](https://github.com/mailru/FileAPI/issues/108): Check width/height before resize by type(min/max)</li>
</ul>


### 1.2.5
<ul>
	<li>[#86](https://github.com/mailru/FileAPI/issues/86): Smarter upload recovery</li>
	<li>[#87](https://github.com/mailru/FileAPI/issues/87): Fixed upload files into browsers that do not support FormData</li>
	<li>Fixed support "accept" attribute for Flash.</li>
	<li>Fixed detection of HTML5 support for FireFox 3.6</li>
	<li> + FileAPI.html5 option, default "true"</li>
</ul>


### 1.2.4
<ul>
	<li>Fixed auto orientation image by EXIF (Flash)</li>
	<li>Fixed image dimensions after rotate (Flash)</li>
	<li>[#82](https://github.com/mailru/FileAPI/issues/82): "undefined" data-fields cause exceptions</li>
	<li>[#83](https://github.com/mailru/FileAPI/issues/83): Allow requests without files</li>
	<li>[#84](https://github.com/mailru/FileAPI/pull/84): Fixed connection abort when waiting for connection recovery</li>
</ul>


### 1.2.3
<ul>
	<li>[#77](https://github.com/mailru/FileAPI/pull/77): Fixed flash.abort(), [#75](https://github.com/mailru/FileAPI/issues/75)</li>
	<li>- `FileAPI.addMime`</li>
	<li>+ `FileAPI.accept` — fallback for flash.</li>
</ul>


### 1.2.2
<ul>
	<li>[#67](https://github.com/mailru/FileAPI/pull/67): Added correct httpStatus for upload fail, [#62](https://github.com/mailru/FileAPI/pull/68)</li>
	<li>[#68](https://github.com/mailru/FileAPI/pull/68) Added "Content-Type" for chunked upload, [#65](https://github.com/mailru/FileAPI/pull/65)</li>
	<li>[#69](https://github.com/mailru/FileAPI/issues/69): Fixed network down recovery</li>
	<li>Fixed progress event, [#66](https://github.com/mailru/FileAPI/issues/66)</li>
	<li>Increase flash stage size, [#73](https://github.com/mailru/FileAPI/pull/73)</li>
	<li>- array index from POST-param "name", [#72](https://github.com/mailru/FileAPI/issues/72)</li>
	<li>- dependency on FileAPI.Image for FileAPI.Flash</li>
</ul>


### 1.2.1
<ul>
	<li>[#64](https://github.com/mailru/FileAPI/issues/64): Bufixed for [#63](https://github.com/mailru/FileAPI/issues/63)</li>
</ul>


### 1.2.0
<ul>
	<li>[#57](https://github.com/mailru/FileAPI/issues/57): Chunked file upload</li>
</ul>


### 1.1.0
<ul>
	<li>[#54](https://github.com/mailru/FileAPI/issues/54): added `FileAPI.flashUrl` and `FileAPI.flashImageUrl`</li>
</ul>


### 1.0.1
<ul>
	<li>[#51](https://github.com/mailru/FileAPI/issues/51): remove circular references from `file-objects` (Flash transport)</li>
	<li>added `changelog`</li>
</ul>


### 1.0.0
<ul>
	<li>first release</li>
</ul>
