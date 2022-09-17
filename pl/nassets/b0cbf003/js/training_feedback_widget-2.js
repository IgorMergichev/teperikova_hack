jQuery.widget('gc.trainingFeedbackWidget', {
	form: null,
	_create: function () {
		this.form = this.element.find('form');
		this._initializeEvents();
	},
	_initializeEvents: function() {
		let _widget = this;

		let $formButtons = _widget.form.find('button');

		_widget.form.on('submit', function (event) {
			$formButtons.attr('disabled', 'disabled');
			ajaxCall(
				_widget.form.attr('action'),
				_widget._getFormData(),
				{},
				function (response) {
					_widget.element.replaceWith(response.data.html);
				},
				function () {
					$formButtons.removeAttr('disabled');
				}
			);
			event.preventDefault();
			event.stopPropagation();
		});

	},
	_getFormData: function () {
		let data = {};
		$.map(this.form.serializeArray(), function (val) {
			data[val['name']] = val['value'];
		});

		return data;
	}
});