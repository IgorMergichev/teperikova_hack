jQuery.widget( 'gc.textField', $.gc.abstractField, {

	build: function() {
		this.input = $('<textarea/>');
        if ( this.field.id ) {
            this.input.attr('id', 'field-input-' + this.field.id);
        }
		this.input.appendTo( this.inputBlock );
	},

	initEditor: function( settingsEl ) {
		$.gc.abstractField.prototype.initEditor.call(this, settingsEl );

		this.placeholderInput = this.makeInputTextarea( 'placeholder', Yii.t( "common", "Placeholder" ) )
		this.colsInput = this.makeInputField( 'cols', Yii.t( "common", "Symbols (width)" ), 3 )
		this.rowsInput = this.makeInputField( 'rows', Yii.t( "common", "Rows" ), 3 )
	},

	getField: function() {
		var result = $.gc.abstractField.prototype.getField.call(this);
		result.settings = {};
		result.settings.placeholder = this.placeholderInput.val();
		result.settings.cols = this.colsInput.val();
		result.settings.rows = this.rowsInput.val();
		return result;
	},

	rebuild: function() {
		$.gc.abstractField.prototype.rebuild.call(this);
		this.input.attr( 'placeholder', this.field.settings.placeholder )
		if ( this.field.settings.cols ) {
			this.input.attr( 'cols', this.field.settings.cols )
		}
		if ( this.field.settings.rows ) {
			this.input.attr( 'rows', this.field.settings.rows )
		}
	},

	getValue: function() {
		return this.input.val();
	}
} );