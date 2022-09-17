jQuery.widget( 'gc.multiSelectField', $.gc.selectField, {

	build: function() {
		this.buildValuesList();
	},

	buildValuesList: function() {
		if ( this.field.settings.valueList )
		{
			var values = this.field.settings.valueList.split("\n");
			this.inputBlock.empty();

			for( i = 0; i < values.length; i++ )
			{
				var value = values[i];

				$label = $( "<label></label>" );
				$label.html( value );

				var $option = $('<input type="checkbox" name="field-value-' + this.field.id + '">');
				$option.attr( 'value', value );
				$option.prependTo( $label );

				$label.appendTo( this.inputBlock );
			}
		}
	},

	initEditor: function( settingsEl ) {
		$.gc.abstractField.prototype.initEditor.call(this, settingsEl );
		this.valueListInput = this.makeInputTextarea( 'valueList', Yii.t( "common", "Value list" ) );
	},

	getField: function() {
		var result = $.gc.abstractField.prototype.getField.call(this);
		result.settings = {};
		result.settings.valueList = this.valueListInput.val();
		return result;
	},

	getValue: function() {
		var result = [];
		this.inputBlock.find( 'input:checked').each( function( index, el ) { result.push( $(el).val() ) });
		return result;
	}

} );