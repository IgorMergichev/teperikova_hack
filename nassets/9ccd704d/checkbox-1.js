jQuery.widget( 'gc.checkboxField', $.gc.abstractField, {

	build: function() {
		$input = $('<input type="checkbox"/>');
        if ( this.field.id ) {
            $input.attr('id', 'field-input-' + this.field.id);
        }
		this.labelEl.find('.required-sign').detach();//.appendTo( this.labelEl.find('.label-value') )
		$input.prependTo( this.labelEl );

		this.input = $input;
	},

	initEditor: function( settingsEl ) {
		$.gc.abstractField.prototype.initEditor.call(this, settingsEl );
	},

	getValue: function() {
		return this.input.prop('checked') ? 1 : 0;
	}
} );