jQuery.widget( 'gc.numericField', $.gc.stringField, {

	initEditor: function( settingsEl ) {
		$.gc.stringField.prototype.initEditor.call(this, settingsEl );

		this.unitsInput = this.makeInputField( 'units', Yii.t( "common", 'Units' ) )

		if ( this.options.chartEnabled ) {
			this.showOnChartInput = this.makeInputCheckbox( 'show_on_chart', Yii.t( "common", "Show on chart" ) )
			this.hideOnChartByDefaultInput = this.makeInputCheckbox( 'hide_on_chart_by_default', Yii.t( "common", "Hidden by default on chart" ) )
		}

	},

	build: function() {
		$.gc.stringField.prototype.build.call(this);

		this.unitsEl = $(' <span class="units"></span>');

		this.unitsEl.insertAfter( this.input )
	},

	rebuild: function() {
		$.gc.stringField.prototype.rebuild.call(this);

		if ( this.field.settings.units ) {
			this.unitsEl.html( " " + this.field.settings.units )
		}
	},

	getField: function() {
		var field = $.gc.stringField.prototype.getField.call(this);

		field.settings.units = this.unitsInput.val();
		if ( this.showOnChartInput ) {
			field.settings.show_on_chart = this.showOnChartInput.prop('checked');
		}

		if ( this.hideOnChartByDefaultInput ) {
			field.settings.hide_on_chart_by_default = this.hideOnChartByDefaultInput.prop('checked');
		}


		return field;
	}


} );