jQuery.widget('gc.starRatingWidget', {
	options: {
		maxRating: 5
	},
	_create: function () {
		this._initializeEvents();
	},
	_initializeEvents: function() {
		let _widget = this;
		let $element = _widget.element;
		let isCursorHover = false;
		let $filledBlock = $element.find('.filled-stars');

		$element
			.on('gc:comment:rating:rate', function (event, rating) {
				$element.find('input').val(rating);
				$element.data('rating', rating);
				$element.trigger('gc:comment:rating:reset');
			})
			.on('gc:comment:rating:preview', function (event, rating) {
				$filledBlock.data('rating', rating).width(Math.round(rating / _widget.options.maxRating * 100) + '%');
			})
			.on('gc:comment:rating:reset', function (event) {
				$element.trigger('gc:comment:rating:preview', [$element.data('rating')]);
			})
			.on('gc:comment:rating:hover', function (event, value) {
				isCursorHover = value;
				if (!isCursorHover) {
					$element.trigger('gc:comment:rating:reset');
				}
			})
		;

		$element
			.on('touchstart touchmove touchend', function (event) {
				let touches = event.originalEvent.changedTouches,
					first = touches[0],
					type = '';
				switch (event.type) {
					case 'touchstart': // init move on touch
					case 'touchmove':
						type = 'mousemove';
						break;
					case 'touchend':
						type = 'mouseup';
						break;
					default:
						return;
				}

				let simulatedEvent = document.createEvent('MouseEvent');
				simulatedEvent.initMouseEvent(
					type,
					true,
					true,
					window,
					1,
					first.screenX,
					first.screenY,
					first.clientX,
					first.clientY,
					false,
					false,
					false,
					false,
					0,
					null
				);

				first.target.dispatchEvent(simulatedEvent);
				event.preventDefault();
			})
			.on('mouseup', function (event) {
				if (isCursorHover) {
					$element.trigger('gc:comment:rating:rate', [$filledBlock.data('rating')]);
				}
			})
			.on('mousemove', function (event) {
				let pageX = (event.changedTouches) ? event.changedTouches[0].pageX : event.pageX;
				let offsetx = pageX - $(this).offset().left;

				if (isCursorHover) {
					if (offsetx < 0 || offsetx > $element.width()) {
						$element.trigger('gc:comment:rating:hover', [false]);
					}
				} else {
					if (offsetx >= 0 && offsetx <= $element.width()) {
						$element.trigger('gc:comment:rating:hover', [true]);
					}
				}

				if (isCursorHover) {
					let rating = Math.ceil((offsetx / $element.width()) * _widget.options.maxRating);
					rating = rating < 1 ? 1 : rating;
					$element.trigger('gc:comment:rating:preview', [rating]);
				}
			})
			.on('mouseover', function (event) {
				$element.trigger('gc:comment:rating:hover', [true]);
			})
			.on('mouseleave', function (event) {
				$element.trigger('gc:comment:rating:hover', [false]);
			})
		;
	}
});
