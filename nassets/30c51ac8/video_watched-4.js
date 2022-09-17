/**
 * @param apiUrl
 * @param fileHashSelector
 * @param payload
 * @constructor
 */
function VideoWatched(apiUrl, fileHashSelector, payload) {
	let files = {};
	this.apiUrl = apiUrl;
	this.payload = payload;

	$(fileHashSelector).each(function (i, item) {
		const el = $(item);
		const str = el.data('vh-files');
		const lessonId = el.data('lesson-id');
		if (lessonId > 0 && str && str.length > 0) {
			const list = str.split(',');
			for (i in list) {
				let hash = list[i].split('.')[0];
				if (hash && hash.length > 0) {
					if (!files[lessonId]) {
						files[lessonId] = [];
					}
					files[lessonId].push(hash);
				}
			}
		}
	});

	this.files = files;
}

VideoWatched.prototype.updateStatuses = function (watchedVideo) {
	const self = this;
	const watchedHashes = watchedVideo.map(item => {
		return item.hash;
	});
	for (let file of Object.entries(self.files)) {
		const lessonId = file[0];
		let isWatched = watchedVideo.length > 0;

		file[1].forEach(local_hash => {
			if (!watchedHashes.includes(local_hash)) {
				isWatched = false;
			}
		});

		if (isWatched) {
			$(`[data-lesson-id=${lessonId}]`).addClass('lesson-list_watched');
		}
	}
};

VideoWatched.prototype.checkWatched = function () {
	const self = this;
	$.ajax({
		url: this.apiUrl,
		method: 'POST',
		data: {json: this.payload}
		}
	).done(function (data) {
		self.updateStatuses(data);
	}).fail(function (data, status) {
		console.log('error--', data, status);
	});
}