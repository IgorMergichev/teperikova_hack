window.gcCreateFieldWidget = function( el, type, options ) {
    var typesMap = {
        "select": "selectField",
        "multi_select": "multiSelectField",
        "string": "stringField",
        "phone": "phoneField",
		"phone_confirm": "phoneConfirmField",
	    "password": "passwordField",
        "text": "textField",
        "date": "dateField",
        "checkbox": "checkboxField",
        "file": "fileField"
    };
    if ( ! typesMap[type] ) {
		type = "string";
        //alert("Не найден тип виджета. type=" + type )
    }
    var widget = el[typesMap[type]]( options )
    return widget;
};

jQuery.widget( 'gc.abstractField', {
	options: {
		types: [],
		field: null,
        hideShowInTableInput: false
	},
	field: null,

	_create: function() {
		if ( ! this.options.field ) {
			return false;
		}
        if ( this.options.field.required == "false" ) {
            this.options.field.required = false;
        }
		this.field = this.options.field;
        this.element.addClass( 'custom-field');
		this.element.addClass( 'type-' + this.field.type );
        this.element.data( 'fieldWidget', this );

		this.labelEl = $("<label class='field-label'><span class='label-value'></span></label>")
        if ( this.field.id ) {
            this.labelEl.attr('for', 'field-input-' + this.field.id);
        }
		this.labelEl.appendTo( this.element )

		this.requiredEl = $('<span class="required-sign">*</span>');
		this.requiredEl.appendTo( this.labelEl )

        this.inputBlock = $('<div class="field-input-block"></div>')
		this.inputBlock.appendTo( this.element )

		this.descriptionBlock = $('<div class="field-description-block"></div>');

		if (window.params_52) {
			this.htmlBlockBlock = $('<div class="field-html_block-block"></div>');

			switch (this.field.html_block_position) {
				case 'top':
					this.htmlBlockBlock.insertBefore(this.element);
					break;
				case 'bottom':
					this.htmlBlockBlock.insertAfter(this.inputBlock);
					break;
				case 'left':
					this.htmlBlockBlock.addClass('html-block-left');
					this.inputBlock.addClass('html-block-left');
					this.htmlBlockBlock.insertBefore(this.inputBlock);
					break;
				case 'right':
					this.htmlBlockBlock.addClass('html-block-right');
					this.inputBlock.addClass('html-block-right');
					this.htmlBlockBlock.insertAfter(this.inputBlock);
					break;
			}
		}

		this.build();
		this.rebuild();
	},

	rebuild: function() {
		this.labelEl.find('.label-value').html( this.field.label );
        if ( this.field.required ) {
			this.element.addClass( 'required' )
		}
		else {
			this.element.removeClass( 'required' )
		}
        if ( this.field.label == "" ) {
            this.labelEl.hide();
        }
        else {
            this.labelEl.show();
        }

		this.descriptionBlock.appendTo(this.element);

		if ( this.field.description && this.field.description.length > 0 ) {
			this.descriptionBlock.html( this.field.description );
			this.descriptionBlock.show();
		}
		else {
			this.descriptionBlock.html( "" );
			this.descriptionBlock.hide();
		}

		if (window.params_52) {
			if (this.field.html_block && this.field.html_block.length > 0) {
				this.htmlBlockBlock.html(this.field.html_block);
				this.htmlBlockBlock.show();
			}
			else {
				this.htmlBlockBlock.html("");
				this.htmlBlockBlock.hide();
			}
		}
	},

	initEditor: function( parentEl ) {

		this.settingsEl = $('<div class="field-settings"></div>');
		this.settingsEl.hide();
		this.settingsEl.appendTo( parentEl );

		this.paramsEl = $('<div class="field-params"></div>')
		this.paramsEl.appendTo( this.settingsEl )

		var $labelInputEl = $(
			"<label class=''>"
			+ Yii.t("common", "Header")
			+ "</label><input class='label-input' type='text' size='40'>"
		);
		$labelInputEl.val( this.field.label );
		$labelInputEl.appendTo( this.paramsEl )
		this._on( $labelInputEl, { input: this.fieldChanged } );

		var $requiredInputWrapper = $(
			"<label style='display: block'>" +  Yii.t("common", "Required") + "</label>"
		);
		$requiredInputWrapper.appendTo( this.paramsEl );
		$requiredInputEl = $("<input class='required-input' type='checkbox' value='1'>");
		$requiredInputEl.prependTo( $requiredInputWrapper );
		$requiredInputEl.prop( "checked", this.field.required );
		this._on( $requiredInputEl, { change: this.fieldChanged } );


		var $hideFilledInputWrapper = $(
			"<label style='display: block'> " +  Yii.t("common", "Hide if filled") + "</label>"
		);
        $hideFilledInputWrapper.appendTo( this.paramsEl );
        $hideFilledInputEl = $("<input class='hide_filled-input' type='checkbox' value='1'>");
        $hideFilledInputEl.prependTo( $hideFilledInputWrapper );
        if ( this.field.hide_filled == "false" ) {
            this.field.hide_filled = false;

        }
        $hideFilledInputEl.prop( "checked", this.field.hide_filled );
        this._on( $hideFilledInputEl, { change: this.fieldChanged } );

		this.descriptionInput = this.makeInputTextarea('description', window.tt('common', 'Description'));
		this.descriptionInput.val( this.field.description );


		if (window.params_52) {
			this.htmlBlockInput = this.makeInputTextarea('html_block', window.tt('common', 'Custom HTML'));
			this.htmlBlockInput.val(this.field.html_block);

			var options = [
				["top", window.tt('common', 'top')],
				["right", window.tt('common', 'right')],
				["bottom", window.tt('common', 'bottom')],
				["left", window.tt('common', 'left')]
			];

			this.htmlBlockPosInput = this.makeSelector('html_block_position', window.tt('common', 'Custom HTML position'), options);
			this.htmlBlockPosInput.val(this.field.html_block_position);
		}

		if (  ! this.options.hideShowInTableInput ) {
            this.showInTableInput = this.makeInputCheckbox('show_in_table', window.tt('common', 'Show in the table of answers (for administrator)'))
            this._on(this.showInTableInput, {change: this.fieldChanged});
            this.showInTableInput.val(this.field.description);
            this.showInTableInput.prop("checked", this.field.show_in_table);
        }

	},

	getField: function() {
		var result = this.field;
		result.label = this.paramsEl.find('.label-input').val();
		result.required = this.paramsEl.find('.required-input').is(':checked');
        result.hide_filled = this.paramsEl.find('.hide_filled-input').is(':checked');
		result.description = this.paramsEl.find('.description-input').val();
		result.show_in_table = this.paramsEl.find('.show_in_table-input').is(':checked');

		if (window.params_52) {
			result.html_block = this.paramsEl.find('.html_block-input').val();
			result.html_block_position = this.paramsEl.find('.html_block_position-input').val();
		}

        return result;
	},

	fieldChanged: function() {
		this.field = this.getField();
		this.rebuild();
        if ( this.element.parents('.custom-form-editor').length > 0 ) {
            this.element.parents('.custom-form-editor').customFormEditor('changed')
        }
        this._onChange();
	},

    _onChange: function() {

    },

	showEditor: function() {
		this.settingsEl.show();
	},

	hideEditor: function() {
		this.settingsEl.hide();
	},

	makeInputField: function( name, label, size ) {
		if ( ! size ) size = 40;

		$settingEl = $("<div class='field-" + name + "'/>");

		$el = $("<input class='" + name + "-input' type='text' size='" + size + "'>");
		$el.val( this.field.settings[name] );
		this._on( $el, { input: this.fieldChanged } );
		$( '<label>' + label + '</label>' ).appendTo( $settingEl );

		$el.appendTo( $settingEl );

		$settingEl.appendTo( this.paramsEl );
		return $el;
	},

	makeInputTextarea: function( name, label ) {

		$settingEl = $("<div class='field-" + name + "'/>");

		$el = $("<textarea class='standard " + name + "-input' type='text'/>");
		$el.val( this.field.settings[name] );
		this._on( $el, { input: this.fieldChanged } );
		$( '<label>' + label + '</label>' ).appendTo( $settingEl );
		$el.appendTo( $settingEl );

		$settingEl.appendTo( this.paramsEl )
		return $el;
	},

	makeSelector: function (name, label, options) {
		$settingEl = $("<label class='field-" + name + "'>" + label + " </label>");

		$el = $( '<select class="'+name+'-input" />' );
 		for (var i in options) {
			var item = options[i];
			$('<option />').val(item[0]).prop('selected', this.field[name] == item[0]).text(item[1]).appendTo($el);
		}

		$el.appendTo($settingEl);

		this._on( $el, { change: this.fieldChanged } );
		$settingEl.appendTo( this.paramsEl )

		return $el;
	},

	makeInputCheckbox: function( name, label ) {

		$settingEl = $("<label class='field-" + name + "'> " + label + "</label>");

		$el = $("<input class='standard " + name + "-input' type='checkbox'/>");
		$el.prop( 'checked', this.field.settings[name] );
		this._on( $el, { change: this.fieldChanged } );
		$el.prependTo( $settingEl );

		$settingEl.appendTo( this.paramsEl )

		return $el;
	},

	getValue: function() {
		return null;
	},

	afterInit: function() {
	}


} );