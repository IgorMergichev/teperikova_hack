jQuery.widget( 'gc.stringField', $.gc.abstractField, {

	build: function() {
		this.input = $('<input/>');
        if ( this.field.id ) {
            this.input.attr('id', 'field-input-' + this.field.id);
        }
		this.input.appendTo( this.inputBlock );
	},

	initEditor: function( settingsEl ) {
        $.gc.abstractField.prototype.initEditor.call(this, settingsEl );

		this.placeholderInput = this.makeInputField( 'placeholder', Yii.t( "common", "Hint" ) )
		this.sizeInput = this.makeInputField( 'size', Yii.t( "common", "Size of the field" ), 3 )
	},

	getField: function() {
		var result = $.gc.abstractField.prototype.getField.call(this);
		if ( ! result.settings || ( Object.prototype.toString.call( result.settings ) === '[object Array]' ) ) {
			result.settings = {};
		}
		result.settings.placeholder = this.placeholderInput.val();
		if ( this.sizeInput ) {
			result.settings.size = this.sizeInput.val();
		}
		return result;
	},

	rebuild: function() {
		$.gc.abstractField.prototype.rebuild.call(this);
        this.input.attr( 'type', this.getInputType() )
        this.input.attr( 'placeholder', this.field.settings.placeholder )
		if ( this.field.settings.size ) {
			this.input.attr( 'size', this.field.settings.size )
		}
	},

	getInputType: function() {
		return "text";
	},

	getValue: function() {
		return this.input.val();
	}

} );