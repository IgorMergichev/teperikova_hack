jQuery.widget( 'gc.selectField', $.gc.abstractField, {

	build: function() {
		this.buildValuesList();
	},

	buildValuesList: function() {
		if ( this.field.settings.valueList )
		{
			var values = this.field.settings.valueList.split("\n");
			this.inputBlock.empty();

			if ( ! this.field.settings.showAllValues ) {
				$input = $('<select/>');

                if ( this.field.id ) {
                    $input.attr('id', 'field-input-' + this.field.id);
                }

				$input.appendTo( this.inputBlock );
				this.input = $input;

				if ( this.field.settings.emptyValueText && this.field.settings.emptyValueText != "" ) {
					var option = $('<option></option>');
					option.attr( 'value', "" );
					option.html( this.field.settings.emptyValueText );
					option.appendTo( this.input );
				}

				for( i = 0; i < values.length; i++ ) {
					var value = values[i];
					var option = $('<option></option>');
					option.attr( 'value', value );
					option.html( value );
					option.appendTo( this.input );
				}
			}
			else {
				if ( this.field.settings.emptyValueText && this.field.settings.emptyValueText != "" )
				{
					$label = $( "<label></label>" );
					$label.html( this.field.settings.emptyValueText );

					var $option = $('<input type="radio" name="field-value-' + this.field.id + '">');
					$option.attr( 'value', "" );
					$option.prependTo( $label );
					$option.prop('checked', true)

					$label.appendTo( this.inputBlock );
				}

				for( i = 0; i < values.length; i++ )
				{
					var value = values[i];

					$label = $( "<label></label>" );
					$label.html( value );

					var $option = $('<input type="radio" name="field-value-' + this.field.id + '">');
					$option.attr( 'value', value );
					$option.prependTo( $label );

					$label.appendTo( this.inputBlock );
				}

			}
		}
	},

	initEditor: function( settingsEl ) {
		$.gc.abstractField.prototype.initEditor.call(this, settingsEl );

		this.valueListInput = this.makeInputTextarea( 'valueList', Yii.t( "common", "Value list" ) );
		this.showAllValuesCheckbox = this.makeInputCheckbox( 'showAllValues', Yii.t( "common", "Show all values" ) );
		this.emptyValueTextInput = this.makeInputField( 'emptyValueText', Yii.t( "common", "Empty value text" ) );

		if (window.params_52) {
			this.valuesGroupTextarea = this.makeInputTextarea('valueListGroups', Yii.t( "common", "Matching options to groups"));
			this.valuesGroupTextarea.val(this.field.settings.valueListGroups);
		}

		//this.valueListInput = this.makeInputTextarea( 'value_list', Yii.t( "common", "Value list" ) )
	},

	getField: function() {
		var result = $.gc.abstractField.prototype.getField.call(this);
		result.settings = {};
		result.settings.valueList = this.valueListInput.val();
		result.settings.showAllValues = this.showAllValuesCheckbox.prop('checked');
		result.settings.emptyValueText = this.emptyValueTextInput.val();
		if ( this.valuesGroupTextarea ) {
			result.settings.valueListGroups = this.valuesGroupTextarea.val();
		}
		return result;
	},

	rebuild: function() {
		$.gc.abstractField.prototype.rebuild.call(this);
		if ( this.field.settings.valueList ) {
			this.buildValuesList();
			//this.input.attr( 'size', this.field.settings.size )
		}
	},

	getValue: function() {
		if ( this.field.settings.showAllValues ) {
			return this.inputBlock.find( 'input:checked').val();
		}
		else {
			return this.input.val();
		}

	}
} );