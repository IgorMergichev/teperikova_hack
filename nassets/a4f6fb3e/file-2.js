jQuery.widget( 'gc.fileField', $.gc.abstractField, {

	build: function() {
		$input = $('<input type="hidden"/>');
        if ( this.field.id ) {
            $input.attr('id', 'field-input-' + this.field.id);
        }
		$input.appendTo( this.labelEl );

        $input.fileWidget({showButtonOnStart:true});


		this.input = $input;
	},
	afterInit: function() {
	    this.input.fileWidget( 'showUploader' );
	},


	initEditor: function( settingsEl ) {
		$.gc.abstractField.prototype.initEditor.call(this, settingsEl );
	},

	getValue: function() {
		return this.input.val();
	},
    valueChanged: function( showFileWidgetIfNull ) {
        this.input.fileWidget( 'showPreview', showFileWidgetIfNull )

    }
} );