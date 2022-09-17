$(function () {
    var state = {
        modal : window.gcModalFactory.create({show:false}),
        $current : undefined,
        pageUri : window.location.pathname,
        objectUri : undefined,
        historyStateExist : false,
        initialHistoryValue : 0,
        modalType : 'frontPopup'
    };
    state.modal.get$Modal().find('.modal-dialog').css('height', '80%');
    var selectors = {
        clickable : '.gc-object-front-popup-clickable',
        swapObjectBtn : '.swap-object-btn',
        popupImgContainer : '.popup-img-container',
        popupContent : '.popup-content',
        maxHeightCalculate : '.max-height-calculate'
    };

    var isHistoryApiAvailable = function () {
        return !!(window.history && history.pushState);
    };
    var setHistory = function(data, uri) {
        if (!isHistoryApiAvailable()) {
            return;
        }
        if (state.historyStateExist) {
            window.history.replaceState(data, null, uri);
        }
        else {
            window.history.pushState(data, null, uri);
            state.historyStateExist = true;
        }
    };

    var callAfterLoadImage = function(imgSrc, callback) {
        var newImg = new Image();

        newImg.onload = function() {
            callback(newImg.width, newImg.height);
        };
        newImg.src = imgSrc;
    };

    var resize = function () {
        var $modal = state.modal.get$Modal();
        var viewportHeight = $(window).height();
        var baseHeight = (viewportHeight * 0.8);

        var $dialog = $modal.find('.modal-dialog');
        var dialogHeight = $dialog.get(0).clientHeight;


        $modal.find(selectors.maxHeightCalculate).css('max-height', dialogHeight-15+'px');

        var contentSelector = state.modal.getContentSelector();
        $modal.find([contentSelector, selectors.popupImgContainer].join(' ')).css('height', dialogHeight-30+'px');
        $modal.find([contentSelector, selectors.popupImgContainer, 'img'].join(' ')).each(function(index, value) {
            var $this = $(this);
            var src = $this.attr('src');
            callAfterLoadImage(src, function(width, height) {
                var topBottom = ((baseHeight - $this.height())/2)-15;
                var rightLeft = ($modal.find('.left-col').width()-$this.width())/2;
                if (width < height) {
                    $this.css('height', baseHeight+'px');
                }
                $this.css('margin', [
                    topBottom > 0 ? topBottom+'px' : 0,
                    rightLeft > 0 ? rightLeft+'px' : 0
                ].join(' ')).css('opacity', 1);
            });
        });
    };
    var getTargetElementToSwapButton = function ($current, $button, offset) {
        offset = offset ? offset : 0;
        var targetSelector = selectors.clickable;
        var $container = $($current.parents('.gc-object-front-popup-list').get(0));
        var elements = $(targetSelector, $container);
        var length = elements.length;
        var index = elements.index($current);
        var targetIndex = $button.hasClass('next') ? index + 1 + offset: index - 1 - offset;
        return targetIndex >= 0 && targetIndex <= (length - 1) ? $(targetSelector, $container).get(targetIndex) : undefined;
    };

    $('body').delegate(selectors.clickable, 'click', function (e, $btn, errorOffset) {
        if ($(window).width() < 1024 || $(window).height() < 600) {// на небольших экранах не открываем вспылвашку
            return true;
        }
        var modal = state.modal;
        //modal.reset();
        var $modal = modal.get$Modal();

        var that = this;
        var oid = $(this).data('object-id');
        var otid = $(this).data('object-type-id');
        ajaxCall('/pl/object/front-popup', {
            object_id: oid,
            object_type_id: otid
        }, {}, function (response) {
            if (response.not_found) {
                if ($btn) {
                    errorOffset = errorOffset ? errorOffset : 0;
                    errorOffset++;
                    var el = getTargetElementToSwapButton(state.$current, $btn, errorOffset);
                    if (undefined !== el) {
                        var $el = $(el);
                        $btn.trigger('click', [errorOffset]);
                    }
                }
                else {
				var notFountLabel = 'Объект не найден';
				if (typeof Yii != 'undefined') {
					notFountLabel = Yii.t("common", notFountLabel);
				}
				$.toast(notFountLabel, {type: "danger"});
                }
                return false;
            }
            var $html = $(response.html);
            var isShowed = false;
            state.objectUri = $html.find('.object-data').data('link');
            $html.find(selectors.popupImgContainer+' img').each(function (index, value) {
                var $this = $(this);
                var src = $this.attr('src');
                callAfterLoadImage(src, function(width, height) {
                    if (!isShowed) {
                        modal.show(state.modalType);
                        state.modal.setContent($html);
                        state.$current = $(that);
                        resize();
                        $modal.find(selectors.swapObjectBtn).each(function (index, value) {
                            var $button = $(this);
                            var el = getTargetElementToSwapButton(state.$current, $button);
                            if (el) {
                                $button.addClass('element-to-swap-exists');
                                $button.show();
                            }
                        });

                        $modal.find('.comment-attach-file-link').click();
                        isShowed = true;
                        if (isHistoryApiAvailable()) {
                            var $that = $(that);
                            var historyUid = $that.data('history-uid');
                            if (!historyUid) {
                                historyUid = 'history-uid-'+(state.initialHistoryValue++);
                                $that.addClass(historyUid).data('history-uid', historyUid);
                            }
                            setHistory({
                                uid : historyUid
                            }, state.objectUri);
                        }
                    }
                });
            });
        });
        return false;
    }).delegate([state.modal.getTopSelector(), selectors.swapObjectBtn].join(' '), 'click', function (e, errorOffset) {
		var $button = $(this);
        var el = getTargetElementToSwapButton(state.$current, $button, errorOffset);
        if (undefined !== el) {
            var $el = $(el);
            $el.trigger('click', [$button]);
        }

        return false;
    });

    $(window).resize(function () {
        resize();
    });

    state.modal.get$Modal().on('hide.bs.modal', function (event) {
        setHistory(null, state.pageUri);
    });

    $(document).keyup(function (event) {
        var modal = state.modal;
        if (modal.isActive()) {
            if (event.keyCode == 37) {
                modal.get$Modal().find(selectors.swapObjectBtn+'.prev').trigger('click');
            }
            if (event.keyCode == 39) {
                modal.get$Modal().find(selectors.swapObjectBtn + '.next').trigger('click');
            }
        }
    });

    window.addEventListener('popstate', function(event) {
        if (!event.state) {
            state.modal.isActive() && state.modal.hide();
        }
        else {
            event.state.uid && $('.'+event.state.uid).trigger('click');
        }
    });
});
