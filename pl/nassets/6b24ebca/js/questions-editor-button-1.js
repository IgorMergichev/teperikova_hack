jQuery.widget( 'gc.questionsEditorButton', {
	options: {
		questionaryId: null,
		newQuestionaryId: null,
		editorOptions: null,
		canDelete: false,
		light: false,
		questionaries: []
	},
	needDelete: false,
	modal: null,
	_create: function () {
		//this.element.html("Тестирование")
		var self = this;

		let noTestingStr = 'Create testing';
		let testingStr = 'Testing. Questions';
		let deleteTestStr = 'Удалить тест из урока';

		if (typeof Yii != 'undefined') {
			noTestingStr = Yii.t('common', noTestingStr);
			testingStr = Yii.t('common', testingStr);
			deleteTestStr = Yii.t('common', deleteTestStr);
		}

		self.questionsEl = $('<div/>')

		if ( self.options.questionaryId ) {
			ajaxCall( "/pl/teach/questionary/get?id=" + self.options.questionaryId, {}, {async: false}, function( response ) {
				var options = self.options.editorOptions;
				options.questionary = response.data.model;
				self.questionsEl.questionsEditor(options);
			} )

			ajaxCall("/pl/teach/questionary/get-list", {}, {}, function(response) {
				self.options.questionaries = response.data.models;
				self._initUseExist($('.js__questionary__use_exists'), false);
			});
		}
		else {
			self.questionsEl.questionsEditor(self.options.editorOptions);

			ajaxCall("/pl/teach/questionary/get-list", {}, {}, function(response) {
				self.options.questionaries = response.data.models;
			});
		}

		var setButtonTitle = function ( onStart ) {
			var value = self.questionsEl.questionsEditor('getValue');

			if ( ( value.questions.length > 0 || value.id > 0 ) && ! value.deleted )  {
				self.element.html(testingStr + ': ' + value.questions.length);
			}
			else {
				self.element.html(noTestingStr);
			}

			if ( ! onStart && self.options.onChange ) {
				self.options.onChange(value);
			}
		};

		self.questionsEl.on('changed', function(e,onStart) {
			//console.log( self.questionsEl.questionsEditor('getValue') );
			setButtonTitle(onStart);
		});
		setTimeout( function() {
			setButtonTitle();
		}, 300 )


		this.element.off('click').on('click', function() {
			if(self.options.questionaryId){
				window.open('/pl/teach/questionary/update-testing?id=' + self.options.questionaryId+ '&part=main');
			} else {
				let $formSelect = $('.js__questionary__use_exists select.js__questionnaire-select');
				let $modalSelect = $('.js__questionnaire_modal_buttons select.js__questionnaire-select');

				if($formSelect.length > 0 && $modalSelect.length > 0) {
					$modalSelect.val($formSelect.val());
					$modalSelect.select2('destroy');
					$modalSelect.select2({
						allowClear: true,
					});
				}
				self.showModal();
			}
		});
	},
	showModal: function() {
		var self = this;

		if ( ! self.modal ) {
			self.modal = window.gcModalFactory.create({show: false});
			self.modal.getModalEl().find('.modal-dialog').width( '600px' )
			if ( this.options.light ) {
				self.modal.getModalEl().find('.modal-dialog').addClass('questionary-light-dialog')
			}



			self.modal.setContent("")
			self.questionsEl.appendTo( self.modal.getContentEl() );

			let acceptStr = 'Accept';
			let addQuestionStr = 'Add question';
			let deleteStr = 'Delete';
			let testSettings ='Настройки тестирования';

			if ( this.options.light ) {
				acceptStr = "Save";
			}
			if (typeof Yii != 'undefined') {
				acceptStr = Yii.t('common', acceptStr);
				deleteStr = Yii.t('common', deleteStr);
				addQuestionStr = Yii.t('common', addQuestionStr);
				testSettings = Yii.t('common', testSettings);
			}

			let $buttonsDiv = $('<div class=""></div>');
			$buttonsDiv.appendTo(self.modal.getFooterEl());
			let $buttonsRow = $('<p></p>');
			$buttonsRow.appendTo($buttonsDiv);

			let $btnApply = $('<button class="btn btn-primary pull-left">'+acceptStr+'</button>');
			$btnApply.appendTo($buttonsRow);
			$btnApply.click( function() {
				if($('.js__questionnaire_modal_buttons select.js__questionnaire-select').find('option:selected').val()){
					let newValue = self.options.newQuestionaryId || $('.js__questionnaire_modal_buttons select.js__questionnaire-select').find('option:selected').val();

					if ( self.options.saveExistQuestionary ) {
						self.options.saveExistQuestionary(newValue);
					} else {
						self.options.questionaryId = newValue;

						self._create();
						self.modal.hide();
						if($('.js__update_testing').length >0) {
							let $updateButton = $('<button ' +
								'onclick="window.open(\'/pl/teach/questionary/update-testing?id=' + newValue + '&part=settings\')"' +
								'class="btn" type="button">' +
								'</button>');
							$updateButton.html('<span class="fa fa-cog"></span> ' + testSettings);
							$('.js__update_testing').html($updateButton);
						}

						if($('.js__questionary__use_exists').length >0) {
							self._initUseExist($('.js__questionary__use_exists'), false);
						}
					}
				} else if (self.questionsEl.questionsEditor('validate')) {
					self.questionsEl.questionsEditor('apply');

					if ( self.options.onTrySave ) {
						let newValue = self.questionsEl.questionsEditor('getValue');
						self.options.onTrySave( newValue, function() {
							self.modal.hide();
						});
					}
					else {

						self.modal.hide();
					}
				}
			});

			let $btnAddQuestion = $('<button class="btn btn-default pull-left"> <span class="fa fa-plus"></span>'+addQuestionStr+'</button>');
			$btnAddQuestion.appendTo($buttonsRow);
			$btnAddQuestion.click( function() {
				self.questionsEl.questionsEditor('addQuestion');
			});

			if ( self.options.canDelete ) {

				let $btnDelete = $('<button class="btn btn-delete btn-danger pull-right">'+deleteStr+'</button>');
				$btnDelete.appendTo ( $buttonsRow );

				$btnDelete.click( function() {
					self._deleteTesting();
				});

			}

			if ( self.options.questionaryId ) {
				//$btnSettings = $('<button class="btn btn-default pull-left"> <span class="fa fa-cog"></span> Настройки тестирования </button>')
				//$btnSettings.appendTo($buttonsRow)
				//$btnSettings.click( function() {
					//window.open( "/pl/teach/questionary/update-testing?id=" + self.options.questionaryId + "&part=settings" )
					//self.modal.hide();
				//})
			}

			if(!self.options.questionaryId) {
				$('<div class="clearfix"></div><p></p>').appendTo(self.modal.getFooterEl());
				let $footerAddExistQuestionnaireRow = $('<div class=""></div>');
				$footerAddExistQuestionnaireRow.appendTo(self.modal.getFooterEl());


				self._initUseExist($footerAddExistQuestionnaireRow, $btnAddQuestion);


			}
		}

		self.modal.show();
	},
	_initUseExist: function ($footerAddExistQuestionnaireRow, $btnAddQuestion = false) {
		var self = this;
		$footerAddExistQuestionnaireRow.empty();
		let useExistQuestionnaireLabel = 'Использовать тестирование';
		let notSelectedQuestionnaire = '--не выбрано--';
		let questionnairies = 'Тестирования';
		let deleteTestStr = 'Удалить тест из урока';

		if (typeof Yii != 'undefined') {
			useExistQuestionnaireLabel = Yii.t('common', useExistQuestionnaireLabel);
			notSelectedQuestionnaire = Yii.t('common', notSelectedQuestionnaire);
			questionnairies = Yii.t('common', questionnairies);
			deleteTestStr = Yii.t('common', deleteTestStr);
		}

		let $useExistQuestionnaireLabel = $('<div class="text-left">' + useExistQuestionnaireLabel + '</div>');
		$useExistQuestionnaireLabel.appendTo($footerAddExistQuestionnaireRow);

		let $useExistQuestionnaire = $('<div class="text-left js__questionnaire_modal_buttons"></div>');
		$useExistQuestionnaire.appendTo($footerAddExistQuestionnaireRow);
		$useExistQuestionnaire.find('select').select2('destroy');
		$useExistQuestionnaire.empty();

		let $selectNode = $('<select class="questionnaire-select js__questionnaire-select" '
			+ 'name="questionnaireId" data-placeholder="'+ notSelectedQuestionnaire
			+'"></select>');
		$selectNode.appendTo($useExistQuestionnaire);

		$('<option></option>').appendTo($selectNode);

		self.options.questionaries.forEach(function(item, i, arr) {
			let selected = (self.options.questionaryId ==  item.value ? 'selected="selected"' : '');
			let $optionAdd = $('<option ' + selected + ' value="'+ item.value +'">' + item.label + '</option>');
			$optionAdd.appendTo($selectNode);
		});

		$selectNode.select2('destroy');
		$selectNode.select2({
			placeholder: notSelectedQuestionnaire,
			allowClear: true,
		});

		if($btnAddQuestion) {
			$selectNode.off('change').on('change', function() {
				let value = $(this).find('option:selected').val();

				self.options.newQuestionaryId = value;
				if(value) {
					$btnAddQuestion.attr('disabled', true);
				} else {
					$btnAddQuestion.attr('disabled', false);
				}
				$('select.js__questionnaire-select').val(value);
			});
		} else {
			$selectNode.off('change').on('change', function() {
				self.options.newQuestionaryId = null;
				let value = $(this).find('option:selected').val();
				self.options.questionaryId = value;
				if(!value) {
					$('.js__update_testing').empty();

					self.options.editorOptions.questionary = {};
					self.options.editorOptions.defaultQuestionaryName = null;
				}
				self._create();
			});
		}


		let $questionnairiesLink = $('<a class="questionnaire-link" href="/pl/teach/questionary" '
			+ 'title="" target="_blank">'
			+ questionnairies + '</a>');
		$questionnairiesLink.appendTo($useExistQuestionnaire);

		if ( self.options.canDelete ) {
			$('.js__delete_testing_button').remove();
			let $deleteFromLessonButton = $('<button class="btn btn-danger js__delete_testing_button" type="button"><span class="glyphicon glyphicon-trash"></span> ' + deleteTestStr + '</button>');
			$deleteFromLessonButton.click(function () {
					self._deleteTesting();
				}
			);
			if ($('.js__update_testing').length > 0) {
				$('.js__update_testing').append(' ');
				$('.js__update_testing').append($deleteFromLessonButton);
			}
			if ($('.note-btn-group.btn-group.note-testing').length > 0) {
				$deleteFromLessonButton.addClass('btn-sm');
				$('.note-btn-group.btn-group.note-testing').append($deleteFromLessonButton);
			}
		}


		return $selectNode;
	},
	_deleteTesting: function () {
		var self = this;
		if ( ! confirm( Yii.t( 'common', 'Are you sure?' ) ) ) {
			return;
		}
		self.questionsEl.questionsEditor('deleteQuestionary');

		if ( self.options.onTrySave ) {
			var newValue = self.questionsEl.questionsEditor('getValue');
			self.options.onTrySave( newValue, function() {
				self.modal.hide();

			});
		} else {
			self.options.questionaryId = null;
			var options = self.options.editorOptions;
			options.questionary = {questions: []};
			self.questionsEl.questionsEditor(options);
			$('#questions-value').val(false);
			self._create();
			if(self.modal) {
				self.modal.hide();
			}
			self.modal = false;
		}

		if($('.js__update_testing').length >0) {
			$('.js__update_testing').empty();
		}

		if($('.js__questionary__use_exists').length >0) {
			$('.js__questionary__use_exists select').select2('destroy');
			$('.js__questionary__use_exists').empty();
		}
	}
});