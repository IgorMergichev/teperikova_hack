/**
 *
 * @param {string} raw
 *
 * @constructor
 */
function IframePlayerEvent(raw) {
	var data = raw;
	if (typeof data === 'string') {
		data = JSON.parse(data);
	}
	this.begin = data['begin'];
	this.end = data['end'];

	/**
	 * @param {Object}
	 */
	this.tags = data['tags'];
}

IframePlayerEvent.prototype.getBegin = function () {
	return this.begin;
};

IframePlayerEvent.prototype.getEnd = function () {
	return this.end;
};


IframePlayerEvent.prototype.getTags = function () {
	return this.tags;
};

window.videoHostingSessionId = Math.random().toString(36).substr(2, 9);

/**
 *
 * @constructor
 */
function PlayerBridgeCommunication() {
	this.urlStatistic = '/pl/fileservice/video-hosting/statistic';
	this.sessionId = window.videoHostingSessionId;

	this.init();
}

PlayerBridgeCommunication.prototype.sendToServer = function (data) {
	return;
	//return navigator.sendBeacon ? this.sendByBeacon(data) : this.sendByXMLHttpRequest(data);
};

/**
 *
 * @param {Object} data
 *
 * @private
 */
PlayerBridgeCommunication.prototype.sendByBeacon = function (data) {
	data['type'] = 'beacon';
	navigator.sendBeacon(this.urlStatistic, JSON.stringify(data));
};

/**
 *
 * @param {Object} data
 *
 * @private
 */
PlayerBridgeCommunication.prototype.sendByXMLHttpRequest = function (data) {
	data['type'] = 'xmlhttp';
	var xhr = new XMLHttpRequest();
	xhr.open("POST", this.urlStatistic, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send(JSON.stringify(data));
};

PlayerBridgeCommunication.prototype.init = function () {
	this.initEvent();
};

PlayerBridgeCommunication.prototype.initEvent = function () {
	window.addEventListener('message', this.onIframeMessage.bind(this), false);
};

/**
 *
 * @param {MessageEvent} msg
 *
 * @private
 */
PlayerBridgeCommunication.prototype.onIframeMessage = function (msg) {
	var event;
	try {
		event = new IframePlayerEvent(msg.data);
	} catch (e) {
		return;
	}

	var isDontSend = event.getBegin() === event.getEnd();
	if (isDontSend) {
		return;
	}
	this.sendToServer(Object.assign({
		'segment_begin': event.getBegin(),
		'segment_end': event.getEnd(),
		'session_id': this.sessionId,
		'location': window.location.href,
		'referer': document.referrer,
	}, event.getTags()));
};

new PlayerBridgeCommunication();

(function () {
	var debugRoots = document.querySelectorAll('.js--vph-root');
	debugRoots.forEach(function (node) {
		node.addEventListener('contextmenu', function (event) {
			if (!(event.shiftKey || event.ctrlKey)) {
				return;
			}

			if (window.event) {
				window.event.returnValue = false;
			}

			var debugTextElem = node.querySelector('.js--vph-debug');
			debugTextElem.classList.add('vph-debug--show');
			event.preventDefault();
		});
	});
})();

var iframesVh = Array.from(document.getElementsByClassName('js--vhi-iframe'));
if (iframesVh.length > 0) {
	var aspectRatioIntervalHandle = setInterval(function () {
		iframesVh.map(function(iframe){
			iframe.contentWindow.postMessage({'msg': 'video-info'}, '*');
		});
	}, 500);
}

window.addEventListener("message", function (event) {
	if (typeof event.data === 'object' && event.data.type === 'vh') {
		clearInterval(aspectRatioIntervalHandle);
		var isVertical = event.data.is_vertical === 'true';
		var videoHash = event.data.video_hash;
		var aspectRatio = event.data.aspect_ratio;
		var vhiRootEl = document.getElementById('vhi-root-' + videoHash);
		vhiRootEl.setAttribute('style', '--video-aspect-ratio: ' + aspectRatio);
		if (isVertical) {
			vhiRootEl.classList.add('vhi-root--vertical');
		}
	}
}, false);
