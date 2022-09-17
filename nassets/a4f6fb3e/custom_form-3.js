jQuery.widget( 'gc.customForm', {
	options: {
		form: []
	},
	selectedFieldEl: null,

	_create: function() {
		var widget = this;

		for( key in this.options.form.fields ) {
			var field = this.options.form.fields[key];
			this.addField( field );
		}
	},

	addField: function( field ) {

		var widget = this;


		$fieldWrapperEl = $('<div class="field-wrapper"/>');
		/*$fieldWrapperEl.click( function() {
			widget.selectField( $(this) );
		});*/

		$fieldEl = $('<div class="field"/>');
		$fieldEl.appendTo( $fieldWrapperEl );

		var $fieldsListEl = this.element.find( '.fields' );
		if ( $fieldsListEl.length == 0 ) {
			$fieldsListEl = $('<div class="fields"></div>')
			$fieldsListEl.appendTo( this.element )
		}


		$fieldWrapperEl.appendTo( $fieldsListEl );
		var type = field.type;

		if ( type == "string" ) {
			$fieldEl.stringField({ field: field });
			$fieldEl.data( 'widgetClass', 'stringField' );
		}
		if ( type == "text" ) {
			$fieldEl.textField({ field: field });
			$fieldEl.data( 'widgetClass', 'textField' );
		}
		if ( type == "checkbox" ) {
			$fieldEl.checkboxField({ field: field });
			$fieldEl.data( 'widgetClass', 'checkboxField' );
		}
		if ( type == "select" ) {
			$fieldEl.selectField({ field: field });
			$fieldEl.data( 'widgetClass', 'selectField' );
		}
		if ( type == "multi_select" ) {
			$fieldEl.multiSelectField({ field: field });
			$fieldEl.data( 'widgetClass', 'multiSelectField' );
		}
		if ( type == "date" ) {
			$fieldEl.dateField({ field: field });
			$fieldEl.data( 'widgetClass', 'dateField' );
		}
		if ( type == "file" ) {
			$fieldEl.fileField({ field: field });
			$fieldEl.data( 'widgetClass', 'fileField' );
		}
		if ( type == "numeric" ) {
			$fieldEl.numericField({ field: field });
			$fieldEl.data( 'widgetClass', 'numericField' );
		}
		this.changed();

		$fieldEl.data('gc-' + $fieldEl.data('widgetClass')).afterInit();

		return $fieldWrapperEl;
	},

	getFields: function() {
		var customFields = $(this.element).find( '.custom-field');
		var result = new Array();
		customFields.each( function( index, el ) {
			var $fieldEl = $( el );
			result.push( $fieldEl.data('gc-' + $fieldEl.data('widgetClass')).getField() );
		})
		return result;
	},

	changed: function() {
/*		if (this.options.valueEl) {
    		var fields = this.getFormValues();
    		this.options.valueEl.val(JSON.stringify( { fields: fields }));
		}*/
	},

	selectField: function() {

	},

	getFormValues: function() {

		var customFields = $(this.element).find( '.custom-field');
		var result = {};
		customFields.each( function( index, el ) {
			var $fieldEl = $( el );
			var fieldWidget = $fieldEl.data('gc-' + $fieldEl.data('widgetClass'));

			if (fieldWidget) {
				var field = fieldWidget.field;
				result[field.id] = fieldWidget.getValue();
			}
		});
		return result;
	}
} );