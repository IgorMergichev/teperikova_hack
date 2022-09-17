window.fileWidgetQueueNum = 15;
jQuery.widget( 'gc.fileWidget', {
    uploader: null,
    showButtonOnStart: false,
    options: {
	    showPreview: true,
        onComplete: null,
        fileSizeLimit: '6GB',
		fileSizeLimitWarning: (typeof Yii != 'undefined') ? Yii.t('common', 'Max size {n} GB', 6) : 'Max size 6 GB'
    },
    _create: function () {
        var self = this;

        var $block = $("<div>");
        $block.insertAfter( this.element );

        this.stateEl = $("<span style='float: left;'>");
        this.stateEl.appendTo( $block );

        this.previewEl = $("<div>")
        this.previewEl.appendTo( $block )

        if ( this.element.val() == "" ) {
            //this.stateEl.html( "Нет файла" );
        }

        var labelChange = 'Изменить';
        var labelDelete = 'Удалить';

        if (typeof Yii != 'undefined') {
            labelChange = Yii.t( "common", "Change" );
            labelDelete = Yii.t( "common", "Delete" );
        }

        var $controlsEl = $("<div>");

        $uploader = $("<a href='javascript:void(0)' class='file-change-link dotted-link'>" + labelChange + "</a>");
	    $uploader.css('marginRight', '5px');
        $uploader.appendTo( $controlsEl );
        this.uploader = $uploader;

        this.deleteLink  = $deleteLink = $( "<a class='dotted-link' style='' href='javascript:void(0)'>" + labelDelete + "</a>" );
        $deleteLink.click( function() {
            self.element.val("");
            self.element.change();
            self.showPreview();
        });
        $deleteLink.appendTo( $controlsEl );
	    if ( this.options.hideDeleteLink ) {
	    	$deleteLink.hide();

	    }

        $controlsEl.appendTo( $block );

        this.showPreview();

        $uploader.click( function() {

            if ( $(this).data('uploadifive-inited' ) ) {
                return;
            }

            window.fileWidgetQueueNum++;
            var queueId = "queue" + window.fileWidgetQueueNum;
            $el = $("<div id='" + queueId + "'></div>")
            $el.insertBefore( $(this))

            var labelUpload = 'Загрузить';

            if (typeof Yii != 'undefined') {
                labelUpload = Yii.t( "common", "Upload" );
            }

            $( this ).uploadifive({
                auto: true,
                buttonText: labelUpload,
                width: 120,
                id: window.queueNum,
                queueID:queueId,
                dnd: false,
                removeCompleted: self.options.removeUploaded,
                multi: false,
                fileSizeLimit: self.options.fileSizeLimit,
                uploadScript : '/fileservice/widget/upload?deprecated=19',
                formData: { fullAnswer: true },
                onUploadError: function( file, errorCode, errorMsg ) {
                    alert("ERROR");
                },
                onUploadComplete: function( e,res  ) {
                    res = JSON.parse( res );
                    self.element.val(res.hash);
                    self.showPreview();
                    self.element.change();
                },
				onUpload: function (filesToUpload, settings) {
					$.ajax({
						url: '/fileservice/widget/create-secret-link',
						method: 'GET',
						data: {
							host: window.fileserviceUploadHost,
							uri: '/fileservice/widget/secure-direct-upload',
							expires: 600
						},
						success: function (data, textStatus, jqXHR) {
							if (data.link) {
								settings.uploadScript = data.link;
							}
						},
						async: false
					});
				}
            });

            if ( self.options.fileSizeLimit && self.options.fileSizeLimitWarning ) {
                var warning = $("<p class='text-muted'>" + self.options.fileSizeLimitWarning + "</p>");
                warning.appendTo( $controlsEl );
            }

			var accept = jQuery(self.element).data('accept');
	        accept = accept === undefined ? '' : accept;
	        if ( self.options.accept ) {
	        	accept = self.options.accept;
	        }
	        if (accept) {
				var $fileInput = jQuery(self.element).next().find('[type="file"]');
				$fileInput.attr('accept', accept);
			}

            $(this).data('uploadifive-inited', true)

        });

        if ( this.options.startWithUploader && ! this.element.val() ) {
            setTimeout( function() {
                $uploader.click();
            }, 100 )

        }


    },
    showUploader: function() {
        this.uploader.click();
    },
    setValue: function( val ) {
        this.element.val( val )
        this.showPreview( true )
    },
    showPreview: function( showFileWidgetIfNull ) {
    	if ( ! this.options.showPreview ) {
    		return;
	    }

    	var value = this.element.val();
	    if ( value && value != "" ) {
		    var thumbnailUrl = null;
			if (isImage(value)) {
				if (this.element.data('thumbnail-url')) {
					thumbnailUrl = this.element.data('thumbnail-url');
				} else if (this.options.thumbnailWidth || this.options.thumbnailHeight) {
					thumbnailUrl = getThumbnailUrl(value, this.options.thumbnailWidth, this.options.thumbnailHeight);
				} else {
					thumbnailUrl = getThumbnailUrl(value, 200, 200);
				}
				this.previewEl.html("<img src='" + thumbnailUrl + "'>");
			} else if (isVideo( value ) && this.options.showVideoPreview !== false) {
				thumbnailUrl = getVideoThumbnailUrl(value, 200, 200);
				this.previewEl.html("<img src='/public/img/dummy.png' width='250'>");
			}
			else {
			    if (value) {
                    value = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
                }

				this.previewEl.html("<a href='" + getDownloadUrl(value) + "'>" + value + "</a>");
			}

		    this.previewEl.show();
			this.deleteLink.show();
        }
        else {
            this.previewEl.hide();
            this.deleteLink.hide();
            if ( showFileWidgetIfNull ) {
                this.uploader.click();
            }
        }
    }
});
