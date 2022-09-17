jQuery.widget( 'gc.questionsEditor', {
	options: {
		questionary: {},
		light: false,
		showAddButton: false,
		inputName: null,
		defaultQuestionaryName: null,
		ownerType: null,
		onChange: null
	},
	deleted: false,
	initRedactor: function( $el, full ) {
		if ( ! ( $el.val().indexOf('<p>') > -1 ) ) {
			return;
		}
		if ( $('#redactorToolbar').length == 0 ) {
			$( '<div  id="redactorToolbar" class="gc-into-main-content redactor-main-toolbar out"></div>' ).appendTo( $(document.body));
		}

		$el.redactor({
			lang: (typeof Yii != 'undefined') ? Yii.translate.config.language : 'ru',
			toolbarExternal: '#redactorToolbar',
			buttonSource: full ? true : null ,
			minHeight: 28,
			plugins: full ? ['source', 'fontcolor', 'fontsize', 'typograph'] : ['source','typograph']
		});

	},
	_create: function () {
		var self = this;
		this.element.addClass("questions-editor");
		if ( this.options.light ) {
			this.element.addClass('questions-editor-light')
		}

		this.element.empty();


		if ( this.options.valueInputSelector ) {
			this.valInput = $(this.options.valueInputSelector);
			if ( this.options.inputName ) {
				this.valInput.attr('name', this.options.inputName)
			}
		}
		else if ( this.options.inputName ) {
			this.valInput = $('<input type="hidden"/>');
			this.valInput.attr('name', this.options.inputName);
			this.valInput.appendTo( this.element )
		}

		this.questionListEl = $('<div class="question-list"></div>');
		this.questionListEl.appendTo( this.element );

		// conflicts with redactor
		this.questionListEl.sortable({
			update: function(e, ui) {
				self.disableClickEvent = true;
				self.preSave();
				//alert("E")
			}
		});

		//this.addStartSettingsToList();
		//this.addFinishSettingsToList();

		if ( this.options.questionary.questions ) {
			for ( var i = 0; i < this.options.questionary.questions.length; i++ ) {
				var question = this.options.questionary.questions[i];
				this.addQuestionToList( question )

			}
		}

		if ( this.options.showAddButton ) {
			this.addQuestionBtn = $(
				'<button type="button" class="btn btn-primary btn-add-question">'
					+'<span class="fa fa-plus"></span> ' + window.tt('common', 'Add question')
				+ '</button>'
			);
			this.addQuestionBtn.appendTo(this.element);
			this.addQuestionBtn.click( function() {
				self.addQuestion();
			});

		}





		self.preSave(true);

		//this.addQuestion()
	},
	addStartSettingsToList: function() {
		let $result = $('<div class="questionary-settings questionary-list-item">');

		let label = window.tt('common', 'Начало  тестирования');

		$('<div class="toggle-expand-link collapsed-data"> <span class="fa fa-play-circle"/> ' + label + '</div>').appendTo( $result )

		let $expandedData = $('<div class="expanded-data"/>').appendTo( $result );
		$('<label class="toggle-expand-link"><span class="fa fa-caret-down"/>'+ label +' </label>').appendTo( $expandedData );

		$(
			'<div class="field-item">'
			+ '<label>'+window.tt('common', 'Заголовок')+'</label>'
			+ '<input type="text" class="form-control questionary-title-input">'
			+'</div>'
		).appendTo( $expandedData );

		$(
			'<div class="field-item">'
			+'<label>'+window.tt('common', 'Описание')+'</label>'
			+'<textarea type="text" class="form-control questionary-description-input"/>'
			+'</div>'
		).appendTo( $expandedData );

		var questionary = this.options.questionary;
		$result.find('.questionary-title-input').val( questionary.before_start_header );
		$result.find('.questionary-description-input').val( questionary.before_start_text );

		this.initQuestionaryListItem( $result );

		$result.appendTo( this.questionListEl );

	},
	addFinishSettingsToList: function() {
		let $result = $('<div class="questionary-settings questionary-list-item">');
		let label = window.tt('common', 'Результаты тестирования');

		$('<div class="toggle-expand-link collapsed-data"> <span class="fa fa-check-circle"/> ' + label + '</div>').appendTo( $result )

		let $expandedData = $('<div class="expanded-data"/>').appendTo( $result );

		$('<label class="toggle-expand-link"><span class="fa fa-caret-down"/> '+ label +' </label>').appendTo( $expandedData );

		let $minPoints = $(
			'<div><label>'
			+ '<input type="checkbox"> '
			+window.tt(
				'common',
				'Не принимать ответ на задание если набрано менее {n} баллов',
				{n: '<input type="text" size="4">'}
			)
			+ '</label></div>'
		);
		$minPoints.appendTo( $expandedData )

		let $maxPoints = $(
			'<div><label>'
			+ '<input type="checkbox"> '
			+window.tt(
				'common',
				'Автоматически принимать ответ на задание если набрано {n} баллов и более',
				{n: '<input type="text" size="4">'}
			)
			+ '</label></div>'
		);
		$maxPoints.appendTo( $expandedData );

		$(
			'<div>'
			+ '<label>'+window.tt('common', 'Текст после результатов')+'</label>'
			+ '<textarea type="text" class="form-control text-after-results"/>'
			+ '</div>'
		).appendTo( $expandedData);



		$result.appendTo( this.questionListEl );
		this.finishSettingsEl = $result;
		this.initQuestionaryListItem( $result );


		return $result;
	},
	addQuestionToList: function( question ) {
		var self = this;

		let strings = {
			question: 'Question',
			deleteQuestion: 'Delete question',
			questionNumber: 'Question number',
			questionDescription: 'question text (optionally)',
			questionVideo: 'Видео вопроса',
			changeQuestionVideo: 'Изменить',
			uploadQuestionVideo: 'Загрузить',
			uploadMaxSize: 'Макс. размер 6 ГБ',
			deleteQuestionVideo: 'Удалить',
			questionPicture: 'Question picture',
			pointsForRightAnswer: 'Points for right answer',
			answerChoice: 'Answer choice',
			right: 'Right',
			actions: 'Actions',
			addAnswer: 'Add answer',
			textInCaseOfRightAnswer: 'Text in case of right answer',
			textInCaseOfError: 'Text in case of error',
			option: 'Option',
			addDescription: 'Description',
			answerMode: 'Ученик должен выбрать все правильные варианты ответа',
			failVideoSelect: 'Видео в процессе транскодирования',
		};
		strings = self.translateStrings(strings);

		var variantsList =
			'<table class="table variants-table">' +
				'<thead><tr>' +
				'<th>'+strings.answerChoice+'</th>' +
				'<th width="100" class="text-center">'+strings.right+'</th>' +
				'<th width="100" class="text-center">'+strings.actions+'</th>' +
				'</tr></thead>' +
				'<tbody class="variant-list"></tbody>' +
			'</table>';

		if ( this.options.light ) {
			variantsList = '<div class="variant-list"></div>'
		}
		var questionVideoInputId = 'questionVideoInput' + Math.floor(Math.random() * 10000) + Date.now();

		var $questionEl = $(
			'<div class="question questionary-list-item js__questionary-list-item">' +
				'<div class="toggle-expand-link collapsed-data"><span class="fa fa-caret-right"></span> <span class="question-title"></span></div>' +
				'<div class="expanded-data">' +
					'<button type="button" class="btn btn-sm btn-link btn-delete-question pull-right">'+strings.deleteQuestion+'</button>' +
					'<div class="form-group">' +
						'<label class="toggle-expand-link"> <span class="fa fa-caret-down"/> '+strings.question+' </label>' +
						'<div class="question-number">'+strings.questionNumber+': <input class="form-control text-center question-order-input" style="width: 50px; display: inline-block"></div>' +
						'<input class="form-control question-title-input" placeholder="' + strings.question + '"/>' +
						'<label><input type="checkbox" class="question-mode-input"/> '+ strings.answerMode +'</label>' +
						'<textarea class="form-control question-description-input" rows=3 placeholder="'+strings.questionDescription+'"/>' +
						'<div class="question-video-wrapper">' + 
							strings.questionVideo + 
							'<br/><input type="hidden" class="question-video-input" id="' + questionVideoInputId + '">' +
							'<div>' +
							'<div class="question-video-preview"></div>' +
							'<a href="javascript:void(0)" class="question-video-input-changer dotted-link">' +
							strings.changeQuestionVideo +
							'</a>' +
							'<div class="question-upload-wrapper" style="display: none;">' +
								'<a href="javascript:void(0)" class="question-video-input-upload">' +
								strings.uploadQuestionVideo +
								'</a>' +
								'<p class="text-muted">' + strings.uploadMaxSize + '</p>' +
							'</div>' +
							'<a href="javascript:void(0)" class="question-video-input-delete dotted-link" style="display: none;">' +
							strings.deleteQuestionVideo +
							'</a>' +
							'</div>' +
						'</div>' +
						'<div class="question-picture-wrapper">' + strings.questionPicture + '<br/><input type="hidden" class="question-image-input"></div>' +
						'<div class="question-points-wrapper">' + strings.pointsForRightAnswer + ': <input placeholder="1" class="text-center form-control question-points-input" style="width: 50px; display: inline-block"></div>' +
					'</div>' +
					'<div class="buttons questionary-buttons">' +
						'<button type="button" class="btn btn-sm btn-link btn-add-variant"> '+strings.addAnswer+'</button>' +
						'<button type="button" class="btn btn-sm btn-link btn-add-description">  '+strings.addDescription +'</button>' +
						'<div class="btn-free-space"></div>' +
						'<button type="button" class="btn btn-sm btn-link btn-set-points">  ' +
							'<span class="button-label"><span class="question-points-html"/> ' +
								window.tt('common', 'балл') +
							'</span>' +
						'</button>' +
						'<button type="button" class="btn btn-sm btn-link btn-set-image question-btn-set-image">  ' +
						'<span class="button-label">' +
							window.tt('common', 'Картинка') +
						'</span>' +
						'</button>' +
						'<button type="button" class="btn btn-sm btn-link question-btn-set-video">  ' +
						'<span class="button-label">' +
						window.tt('common', 'Видео') +
						'</span>' +
						'</button>' +
					'</div>' +

					variantsList +



					'<div class="answer-text-params">' +
						'<div class="form-group" style="margin-top: 10px">' +
							'<label>'+strings.textInCaseOfRightAnswer+'</label>' +
							'<textarea class="form-control question-answer-right-input" placeholder=""/>' +
						'</div>' +

						'<div class="form-group">' +
							'<label>'+strings.textInCaseOfError+'</label>' +
							'<textarea class="form-control question-answer-error-input" placeholder=""/>' +
						'</div>' +
					'</div>' +

				'</div>' +
			'</div>'
		);
		$questionEl.appendTo( this.questionListEl );

		if ( ! this.options.questionary.isUseAnswerText ) {
			$questionEl.find('.answer-text-params').hide();
		}

		$questionEl.find('.btn-add-description').click( function() {
			$questionEl.find('.question-description-input').show();
			$questionEl.find('.question-description-input').focus();
			$(this).hide();

		});

		$questionEl.find('.btn-set-points').click( function() {
			$questionEl.find('.question-points-wrapper').show();
			$(this).hide();

		});

		$questionEl.find('.btn-set-image').click( function() {
			$questionEl.find('.question-picture-wrapper').show();
			$questionEl.find('.question-video-wrapper').hide();
			if ($questionEl.find('.question-image-input').val() === '') {
				$questionEl.find('.question-btn-set-video').show();
			}
			$(this).hide();

		});
		$questionEl.find('.question-video-input-changer').click(function () {
			$(this).hide();
			$questionEl.find('.question-upload-wrapper').show();
		});
		$questionEl.find('.question-video-input-upload').click(function () {
			window.gcSelectFiles({
				selectedHash: $questionEl.find('.question-video-input').val(),
				type: 'video',
				accept: '.mkv,.mov,.mp4,.avi',
				isShowHint: true,
				callback: function (hash) {
					self.setQuestionVideo($questionEl, hash);
				},
			});
		});
		$questionEl.find('.question-video-input-delete').click(function () {
			self.setQuestionVideo($questionEl, '');
			$questionEl.find('.question-video-preview').text('');
			$questionEl.find('.question-video-wrapper').show();
			$questionEl.find('.question-upload-wrapper').show();
			$questionEl.find('.question-video-input-changer').hide();
			$questionEl.find('.question-btn-set-video').hide();
			$(this).hide();
		})
		
		$questionEl.find('.question-btn-set-video').click(function () {
			$questionEl.find('.question-video-wrapper').show();
			$questionEl.find('.question-picture-wrapper').hide();
			$questionEl.find('.question-btn-set-video').hide();
			$questionEl.find('.question-btn-set-image').show();
			$(this).hide();
		});

		var noName = 'Question';
		if (typeof Yii != 'undefined') {
			noName = Yii.t('common', noName);
		}

		$questionEl.find( '.question-title-input' ).val( question.title );
		$questionEl.find('.question-mode-input').prop( 'checked',  question.params.right_if_all);
		$questionEl.find( '.question-title' ).html( question.title ? question.title : noName );
		$questionEl.find( '.question-answer-right-input' ).val( question.params.right_text );
		$questionEl.find( '.question-answer-error-input' ).val( question.params.error_text );

		$questionEl.find( '.question-description-input' ).val( question.description );
		if( question.description && question.description != "<p></p>" ) {
			$questionEl.find('.btn-add-description').click();
		}

		this.initRedactor( $questionEl.find( '.question-description-input' ), true );
		$questionEl.find( '.question-points-input' ).val( question.params.right_points );

		var points = 1;
		if ( question.params.right_points &&  question.params.right_points.trim() != "" ) {
			points = question.params.right_points;
			$questionEl.find('.btn-set-points').click();
		}
		if ( question.params.image &&  question.params.image.trim() != "" ) {
			$questionEl.find('.btn-set-image').click();
		}
		$questionEl.find( '.question-points-html' ).html(points)

		$questionEl.find( '.question-title-input' ).change( function() {
			var val = $(this).val();
			$questionEl.find( '.question-title' ).html( val.length > 0 ? val : noName );
		});

		self.initQuestionaryListItem( $questionEl );

		$questionEl.data('question', question);
		$questionEl.data( 'id', question.id );
		$questionEl.find(".question-image-input").val( question.params.image );
		$questionEl.find(".question-image-input").trigger('change');
		$questionEl.find(".question-image-input").fileWidget({showButtonOnStart:true});
		$questionEl.find('.question-order-input').val( this.questionListEl.find( '.question' ).length );

		$questionEl.find(".question-video-input").on('change', function() {
			if ($(this).val() !== '') {
				$
					.get('/pl/teach/questionary/questionary-video?hash=' + $(this).val())
					.done(function (response) {
						$questionEl.find('.question-video-preview').html('<div class="questions-video-player">' + response + '</div>');
						var questionModal = $questionEl.parents('.modal');
						if (questionModal && questionModal.length > 0) {
							// фикс для скролла
							questionModal.modal('hide');
							questionModal.modal('show');
						}
					})
					.fail(function () {
						$questionEl.find('.question-video-preview').html(strings.failVideoSelect);
					})
				;
				$questionEl.find('.question-image-input').val('');
				$questionEl.find('.question-image-input').trigger('change');
				$questionEl.find('.question-video-wrapper').show();
				$questionEl.find('.question-picture-wrapper').hide();
				$questionEl.find('.question-picture-wrapper').find('.question-image-input').next().find('div').first().text('');
				$questionEl.find('.question-picture-wrapper').find('.uploadifive-queue-item.complete').hide();
				$questionEl.find('.question-btn-set-image').hide();
				$questionEl.find('.question-btn-set-video').hide();
				$questionEl.find('.question-video-input-delete').show();
				$questionEl.find('.question-upload-wrapper').hide();
				$questionEl.find('.question-video-input-changer').show();
			} else {
				$questionEl.find('.question-video-wrapper').hide();
				$questionEl.find('.question-btn-set-image').show();
				$questionEl.find('.question-btn-set-video').show();
				if ($questionEl.find('.question-image-input').val() !== '') {
					$questionEl.find('.question-btn-set-image').hide();
					$questionEl.find('.question-btn-set-video').hide();
				}
			}
		});
		this.setQuestionVideo($questionEl, question.params.video);
		$questionEl.find('.question-image-input').on('change', function () {
			if ($(this).val() !== '') {
				self.setQuestionVideo($questionEl, '');
			}
			$questionEl.find('.question-video-input-delete').hide();
			$questionEl.find('.question-video-preview').text('');
			$questionEl.find('.question-btn-set-video').hide();
			$questionEl.find('.question-btn-set-image').hide();
			if ($(this).val() === '') {
				$questionEl.find('.question-btn-set-video').show();
			}
		});

		if ( question.variants ) {
			for (var i = 0; i < question.variants.length; i++ ) {
				var variant = question.variants[i];
				self.addVariantToQuestion( $questionEl, variant )
			}
		}
		$questionEl.find('.variant-list').sortable({
			handle: '.variant-sort-handler'

		});

		var addVariantBtn = $questionEl.find('.btn-add-variant');
		addVariantBtn.click( function() {
			var val = strings.option;
			if ( self.options.light ) {
				val = "";
			}
			let variant = {id: null, value: val, points: null, is_right: false, params: {right_text: null, error_text: null}};

			var $variantEl = self.addVariantToQuestion($questionEl, variant);
			$variantEl.find('.variant-value').focus();
		});

		$questionEl.find( '.btn-delete-question' ).click( function() {
			$questionEl.remove();
			self.selectControl();
		});

		return $questionEl;

	},
	setQuestionVideo: function($el, $video_hash) {
		$el.find(".question-video-input").val($video_hash).trigger('change');
	},
	setVariantVideo: function($el, $video_hash) {
		$el.find('.variant-video-input').val($video_hash).trigger('change');
	},
	initQuestionaryListItem: function( $el ) {
		var self = this;

		$el.find('.toggle-expand-link').click( function(e) {
			if ( self.disableClickEvent ) {
				self.disableClickEvent = false;
				return;
			}

			if ( ! $el.hasClass('expanded' )) {
				$('.questionary-list-item.expanded').removeClass('expanded')

			}

			$el.toggleClass( "expanded" );
			if ( $el.hasClass('expanded') ) {
				$el.find('.question-title-input').focus()
			}
			self.afterQuestionExpand();
		});

	},
	addVariantToQuestionLight: function( $questionEl, variant ) {
		var self = this;

		let strings = {
			noteIfYouChooseThisAnswerOption: 'Notice if you choose this answer option',
			noteIfThisOptionIsCorrectButYouChooseAnother: 'Notice if this option is correct but you choose another',
			points: 'points',
			variantPicture: 'Variant picture',
			variantVideo: 'Видео ответа',
			changeVariantVideo: 'Изменить',
			uploadVariantVideo: 'Загрузить',
			uploadMaxSize: 'Макс. размер 6 ГБ',
			deleteVariantVideo: 'Удалить',
			failVideoSelect: 'Видео в процессе транскодирования',
		};
		strings = self.translateStrings(strings);


		/*var hiddenInputs = '<input class="variant-points" type="hidden">' +
			'<input class="variant-answer-right-input" type="hidden">' +
			'<input class="variant-answer-error-input" type="hidden">';*/

		var additionalFields = $('<div class="additional-field"/>');

		$( '<div>'
			+ '<label>' + strings.noteIfYouChooseThisAnswerOption + '</label>'
			+ '<textarea class="form-control variant-answer-right-input" placeholder=""></textarea>'
			+ '</div>').appendTo( additionalFields );

		//$( '<div><label>' + strings.noteIfThisOptionIsCorrectButYouChooseAnother + '</label>' +
		//	'<textarea class="form-control variant-answer-error-input" placeholder=""></textarea>' + ' </div>').appendTo( additionalFields );

		$('<input class="variant-answer-error-input" type="hidden">').appendTo( additionalFields );

		$(
			'<div>'
				+ window.tt(
					'common',
					'за этот ответ дается {n} баллов',
					{n: '<input class="variant-points" type="text" size="3">'}
				)
			+ '</div>'
		).appendTo( additionalFields );


		var $variantEl = $('<div class="question-variant">'
			+ '<input class="variant-is-right" type="checkbox" />'
			+ '<textarea rows="1" placeholder="'+window.tt('common', 'Вариант ответа')
			+ '" type="text" class="variant-value" />'
			+ '<span class="variant-sort-handler fa fa-arrows"></span>'
			+ '<span class="variant-settings-link fa fa-cog"></span>'
			+ '<span class="btn-delete variant-delete-link fa fa-trash"></span>'
			+ '<div class="variant-video-wrapper">' + strings.variantVideo
			+ '<br/><input type="hidden" class="variant-video-input">'
			+ '<div class="variant-video-preview"></div>'
			+ '<a href="javascript:void(0)" class="variant-video-input-changer dotted-link">'
			+ strings.changeVariantVideo
			+ '</a>'
			+ '<div class="variant-upload-wrapper" style="display: none;">'
			+ '<a href="javascript:void(0)" class="variant-video-input-upload">'
			+ strings.uploadVariantVideo
			+ '</a>'
			+ '<p class="text-muted">' + strings.uploadMaxSize + '</p>'
			+ '</div>'
			+ '<a href="javascript:void(0)" class="variant-video-input-delete dotted-link" style="display: none;">'
			+ strings.deleteVariantVideo
			+ '</a>'
			+ '</div>'
			+ '<div class="variant-picture-wrapper">' + strings.variantPicture
			+ '<br/><input type="hidden" class="variant-image-input">'
			+ '</div>'
			+ '<button type="button" class="btn btn-sm btn-link btn-set-image variant-btn-set-image">  '
			+ '<span class="button-label">' + window.tt('common', 'Картинка') + '</span>'
			+ '</button>'
			+ '<button type="button" class="btn btn-sm btn-link variant-btn-set-video">  '
			+ '<span class="button-label">' + window.tt('common', 'Видео') + '</span>'
			+ '</button>'
			+ '</div>'
		);
		additionalFields.appendTo( $variantEl );

		var splittedVariantValue = variant.value.split('image_')[0];
		splittedVariantValue = splittedVariantValue.split('video_')[0];
		$variantEl.find('.variant-value').val( splittedVariantValue );
		$variantEl.find('.variant-is-right').prop( 'checked', variant.is_right )
		$variantEl.find('.variant-points').prop( 'disabled', !variant.is_right );
		$variantEl.find('.variant-settings-link').click( function() {
			additionalFields.toggle(300);

		});
		$variantEl.find(".variant-image-input").val( variant.params.image );
		$variantEl.find(".variant-image-input").trigger('change');
		$variantEl.find(".variant-image-input").fileWidget({showButtonOnStart:true});
		$variantEl.find(".variant-video-input").on('change', function () {
			if ($(this).val() !== '') {
				$
					.get('/pl/teach/questionary/questionary-video?hash=' + $(this).val())
					.done(function (response) {
						$variantEl.find('.variant-video-preview').html('<div class="questions-video-player">' + response + '</div>');
						var questionModal = $variantEl.parents('.modal');
						if (questionModal && questionModal.length > 0) {
							// фикс для скролла
							questionModal.modal('hide');
							questionModal.modal('show');
						}
					})
					.fail(function () {
						$variantEl.find('variant-video-preview').html(strings.failVideoSelect);
					})
				;
				$variantEl.find('.variant-image-input').val('');
				$variantEl.find('.variant-image-input').trigger('change');
				$variantEl.find('.variant-video-wrapper').show();
				$variantEl.find('.variant-picture-wrapper').hide();
				$variantEl.find('.variant-picture-wrapper').find('.variant-image-input').next().find('div').first().text('');
				$variantEl.find('.variant-picture-wrapper').find('.uploadifive-queue-item.complete').hide();
				$variantEl.find('.variant-btn-set-image').hide();
				$variantEl.find('.variant-btn-set-video').hide();
				$variantEl.find('.variant-video-input-delete').show();
				$variantEl.find('.variant-upload-wrapper').hide();
				$variantEl.find('.variant-video-input-changer').show();
			} else {
				$variantEl.find('.variant-video-wrapper').hide();
				$variantEl.find('.variant-btn-set-image').show();
				$variantEl.find('.variant-btn-set-video').show();
				if ($variantEl.find('.variant-image-input').val() !== '') {
					$variantEl.find('.variant-btn-set-image').hide();
					$variantEl.find('.variant-btn-set-video').hide();
				}
			}
		});
		$variantEl.find('.variant-image-input').on('change', function () {
			if ($(this).val() !== '') {
				self.setVariantVideo($variantEl, '');
			}
			$variantEl.find('.variant-video-input-delete').hide();
			$variantEl.find('.variant-video-preview').text('');
			$variantEl.find('.variant-btn-set-video').hide();
			$variantEl.find('.variant-btn-set-image').hide();
			if ($(this).val() === '') {
				$variantEl.find('.variant-btn-set-video').show();
			}
		});
		this.setVariantVideo($variantEl, variant.params.video);

		$variantEl.find('.btn-set-image').click( function() {
			$variantEl.find('.variant-picture-wrapper').show();
			$variantEl.find('.variant-video-wrapper').hide();
			if ($variantEl.find('.variant-image-input').val() === '') {
				$variantEl.find('.variant-btn-set-video').show();
			}
			$(this).hide();
		});
		$variantEl.find('.variant-btn-set-video').click( function() {
			$variantEl.find('.variant-video-wrapper').show();
			$variantEl.find('.variant-picture-wrapper').hide();
			$variantEl.find('.variant-btn-set-image').show();
			$(this).hide();
		});
		$variantEl.find('.variant-video-input-changer').click(function () {
			$(this).hide();
			$variantEl.find('.variant-upload-wrapper').show();
		});

		$variantEl.find('.variant-video-input-upload').click(function () {
			window.gcSelectFiles({
				selectedHash: $variantEl.find('.variant-video-input').val(),
				type: 'video',
				accept: '.mkv,.mov,.mp4,.avi',
				isShowHint: true,
				callback: function (hash) {
					self.setVariantVideo($variantEl, hash);
				},
			});
		});

		$variantEl.find('.variant-video-input-delete').click(function () {
			self.setVariantVideo($variantEl, '');
			$variantEl.find('.variant-video-preview').text('');
			$variantEl.find('.variant-video-wrapper').show();
			$variantEl.find('.variant-upload-wrapper').show();
			$variantEl.find('.variant-video-input-changer').hide();
			$variantEl.find('.variant-btn-set-video').hide();
			$(this).hide();
		});

		if (variant.params.image && variant.params.image.trim() !== '') {
			$variantEl.find('.btn-set-image').click();
		}

		var changeVariantsIsRight = function() {
			var variantIsRight = $variantEl.find('.variant-is-right').prop('checked');
			if (variantIsRight) {
				$variantEl.addClass('is-right');
			}
			else {
				$variantEl.removeClass('is-right');
			}
			$variantEl.find('.variant-points').prop('disabled', !variantIsRight);
		};

		$variantEl.find('.variant-is-right').change(changeVariantsIsRight);

		changeVariantsIsRight();
		return $variantEl;

	},
	addVariantToQuestion: function( $questionEl, variant ) {
		var self = this;


		var $variantEl = null;
		if ( this.options.light ) {
			$variantEl = this.addVariantToQuestionLight( $questionEl, variant )
		}
		else {
			let strings = {
				noteIfYouChooseThisAnswerOption: 'Notice if you choose this answer option',
				noteIfThisOptionIsCorrectButYouChooseAnother: 'Notice if this option is correct but you choose another',
				points: 'points',
				variantPicture: 'Variant picture'
			};
			strings = self.translateStrings(strings);

			$variantEl = $(
				'<tr class="question-variant">' +
				'<td>' +
				'<textarea placeholder="'+window.tt('common', 'Вариант ответа')+'" rows=1 type="text" class="variant-value form-control"/>' +
				'<div class="additional-field"><label>' + strings.noteIfYouChooseThisAnswerOption + '</label>' +
				'<textarea class="form-control variant-answer-right-input" placeholder=""></textarea></div>' +
				'<div class="additional-field"><label>' + strings.noteIfThisOptionIsCorrectButYouChooseAnother + '</label>' +
				'<textarea class="form-control variant-answer-error-input" placeholder=""></textarea></div>' +
				'</td>' +
				'<td class="text-center">' +
				'<input class="variant-is-right" type="checkbox">' +
				'<div class="variant-points-wrapper additional-field">' +
				'<div class="variant-points-wrapper additional-field">' +
				'<input class="variant-points" type="text" size="3"> <br/> ' + strings.points +
				'</div>' +
				'</td>' +
				'<td class="text-center"><span class="btn btn-link btn-delete"><span class="fa fa-times"></span></span></td>' +
				'</tr>'
			);
			$variantEl.find('.variant-is-right').prop( 'checked',  variant.is_right );
		}
		$variantEl.appendTo( $questionEl.find('.variant-list') );
		var _variantValue = variant.value.split('image_')[0];
		_variantValue = _variantValue.split('video_')[0];
		this.initRedactor( $variantEl.find('.variant-value').val(_variantValue), false );
		this.initRedactor( $variantEl.find('.variant-answer-right-input').val( variant.params.right_text ) );
		this.initRedactor( $variantEl.find('.variant-answer-error-input').val( variant.params.error_text ) );
		$variantEl.find('.variant-points').val( variant.points );


		$variantEl.data( 'id', variant.id );

		$variantEl.find('.btn-delete').click( function() {
			if ( confirm( Yii.t( 'common', 'Are you sure?' ) ) ) {
				$variantEl.detach();
			}
		});

		$variantEl.data( 'variants', $variantEl );
		return $variantEl;
	},

	getValue: function() {
		var self = this;

		var result = {
			id: self.options.questionary.id,
			questions: [],
			deleted: self.deleted,
			defaultQuestionaryName: self.options.defaultQuestionaryName,
			ownerType: self.options.ownerType
		};


		this.element.find('.question').each( function( index, el ) {
			var $el = $(el);

			var question = { };
			question.order = $el.find( '.question-order-input' ).val();
			question.title = $el.find('.question-title-input').val();
			question.description = $el.find('.question-description-input').val();
			question.order_pos = index;
			question.id = $el.data('id');
			question.params = {
				right_text: $el.find('.question-answer-right-input').val(),
				error_text: $el.find('.question-answer-error-input').val(),
				right_points: $el.find('.question-points-input').val(),
				image: $el.find('.question-image-input').val(),
				video: $el.find('.question-video-input').val()
			};
			question.params.right_if_all= $el.find('.question-mode-input').prop('checked');

			question.variants = [];

			var variants = [];
			$el.find('.question-variant').each( function( index, varEl ) {
				var variant = {};
				var $varEl = $(varEl);
				variant.value = $varEl.find('.variant-value').val();
				variant.points = $varEl.find('.variant-points').val();
				variant.id = $varEl.data('id');
				variant.is_right = $varEl.find('.variant-is-right').prop('checked');
				variant.params = {
					right_text: $varEl.find('.variant-answer-right-input').val(),
					error_text: $varEl.find('.variant-answer-error-input').val(),
					image: $varEl.find('.variant-image-input').val(),
					video: $varEl.find('.variant-video-input').val()
				};

				question.variants.push( variant )
			});

			result.questions.push( question );
		});

		result.setParams = {};
		result.setParams.before_start_header = this.element.find('.questionary-title-input').val();
		result.setParams.before_start_text = this.element.find('.questionary-description-input').val();

		return result;
	},

	addQuestion: function() {
		let newQuestionStr = 'New question';
		if (typeof Yii != 'undefined') {
			newQuestionStr = Yii.t('common', newQuestionStr);
		}
		if ( this.options.light ) {
			newQuestionStr = "";
		}
		var question = {
			id: null,
			title: "",
			variants: [],
			params: {}
		};

		question.params = {
			right_if_all: true
		};

		$(".questionary-list-item.expanded").removeClass('expanded')

		var $questionEl = this.addQuestionToList( question );
		$questionEl.addClass("expanded")
		$questionEl.find('.question-title-input').focus();
		this.afterQuestionExpand();
		this.selectControl();
	},
	afterQuestionExpand: function() {
		if ( $(".question.expanded").length > 0 ) {
			this.questionListEl.sortable('disable');
		}
		else {
			this.questionListEl.sortable('enable');
		}

	},
	changed: function() {
		//this.preSave();
	},
	preSave: function( onStart) {
		if( this.options.inputName ) {
			this.element.trigger('changed', onStart );
			this.valInput.val( JSON.stringify( this.getValue() ) )
		}
	},
	validate: function() {
		let formValue = this.getValue();
		let success = true;
		let message = '';
		let isYii = (typeof Yii != 'undefined');
		formValue.questions.forEach(function(question) {
			let questionNumber = '#'+question.order;
			if (question.title.length > 255) {
				if (isYii) {
					message = Yii.t('common', 'Question title greater than 255 symbols: {n}', {n: questionNumber});
				}
				success = false;
			}
			if (success === false) {
				return;
			}
			if (question.variants.length === 0) {
				message = window.tt('common', 'Не заданы варианты для вопроса') + ':' + questionNumber;
				if (isYii) {
					message = Yii.t('common', 'There are no variants for question: {n}', {n: questionNumber});
				}
				success = false;
			} else {
				let variants = question.variants;
				let variantValues = [];
				variants.forEach(function(variant, index) {
					let variantValue = variant.value.split('image_')[0].trim();
					variantValue = variantValue.split('video_')[0].trim();
					let variantImage = variant.params.image;
					let variantVideo = variant.params.video;
					if (variantImage && variantImage.length > 0) {
						variantValue = variantImage;
					}
					if (variantVideo && variantVideo.length > 0) {
						variantValue = variantVideo;
					}
					if (variantValue.length === 0) {
						if (isYii) {
							message = Yii.t('common', 'There are empty variant for question: {n}', {n: questionNumber});
						}
						success = false;
						return;
					}

					if(variant.points < 0) {
						if (isYii) {
							message = Yii.t('common', 'Некорректное количество баллов за вариант {index} в вопросе {n}', {n: questionNumber, index: index+1});
						}
						success = false;
						return;
					}

					variantValues.push(variantValue);
				});
				if (success === false) {
					return;
				}
				let uniqueValues = variantValues.filter((v, i, a) => a.indexOf(v) === i);
				if (variantValues.length !== uniqueValues.length) {
					if (isYii) {
						message = Yii.t('common', 'There are non-unique variants for question: {n}', {n: questionNumber});
					}
					success = false;
				}
			}


			if(question.params.right_points < 0) {
				if (isYii) {
					message = Yii.t('common', 'Некорректное количество баллов за правильный ответ в вопросе {n}', {n: questionNumber});
				}
				success = false;
				return;
			}

			return success;
		});

		if (success === false) {
			if ($.toast) {
				$.toast(message, {type: 'danger'});
			} else {
				alert(message);
			}
		}

		return success;
	},
	deleteQuestionary: function() {
		this.deleted = true;
		this.preSave();
	},
	apply: function() {
		this.deleted = false;
		return this.preSave();
	},
	selectControl: function () {
		if($('.js__questionary-list-item').length > 0) {
			$('.js__questionnaire-select').prop("disabled", true);
		} else {
			$('.js__questionnaire-select').prop("disabled", false);
		}
	},
	translateStrings: function(strings) {
		if (typeof Yii != 'undefined') {
			for (let key in strings) {
				if (!strings.hasOwnProperty(key)) continue;
				strings[key] = Yii.t('common', strings[key]);
			}
		}

		return strings;
	}
});