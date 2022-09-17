jQuery.widget( 'gc.dateField', $.gc.stringField, {

	build: function() {
		var $input = $('<input type="text" autocomplete="off" />');
        if ( this.field.id ) {
            $input.attr('id', 'field-input-' + this.field.id);
        }
        $input.appendTo( this.inputBlock );

        $input.datepicker({
            autoclose: true,
            format: "dd.mm.yyyy",
            language: "ru",
            weekStart: 1
        } );

		this.input = $input;
	},

	initEditor: function( settingsEl ) {
		$.gc.stringField.prototype.initEditor.call(this, settingsEl );
	},

	getValue: function() {
		return this.input.val();
	}
} );