window.fileWidgetQueueNum = 15;
jQuery.widget( 'gc.fileWidget', {
    uploader: null,
    showButtonOnStart: false,
    options: {
        onComplete: null
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

        var $controlsEl = $("<div style='padding-top: 10px'>");

        $uploader = $("<a href='javascript:void(0)' class='dotted-link'>" + labelChange + "</a>");
        $uploader.appendTo( $controlsEl );
        this.uploader = $uploader;

        this.deleteLink  = $deleteLink = $( "<a class='dotted-link' style='margin-left: 10px' href='javascript:void(0)'>" + labelDelete + "</a>" );
        $deleteLink.click( function() {
            self.element.val("");
            self.element.change();
            self.showPreview();
        });
        $deleteLink.appendTo( $controlsEl )

        $controlsEl.appendTo( $block );

        this.showPreview();

        $uploader.click( function() {

            if ( $(this).data('uploadifive-inited' ) ) {
                return;
            }

            window.fileWidgetQueueNum++;
            var queueId = "queue" + window.fileWidgetQueueNum;
            $el = $("<div id='" + queueId + "'></div>")
            $el.insertAfter( $(this))

            var labelUpload = 'Загрузить';

            if (typeof Yii != 'undefined') {
                labelUpload = Yii.t( "common", "Upload" );
            }

            var uploadifiveParams = {
                auto: true,
                buttonText: labelUpload,
                width: 120,
                id: window.queueNum,
                queueID: queueId,
                dnd: false,
                removeCompleted: true,
                multi: false,
                uploadScript: '/fileservice/widget/upload?deprecated=1',
                formData: {fullAnswer: true},
                onUploadError: function (file, errorCode, errorMsg) {
                    alert("ERROR");
                },
                onUploadComplete: function (e, res) {
                    res = JSON.parse(res);
                    self.element.val(res.hash);
                    self.showPreview();
                    self.element.change();
                }
            };

            if (window.isEnabledSecureUpload && window.fileserviceUploadHost) {
                uploadifiveParams.onUpload = getUploadifySecretLink;
            }

            $(this).uploadifive(uploadifiveParams);

            $(this).data('uploadifive-inited', true)
        })
    },
    showUploader: function() {
        this.uploader.click();
    },
    showPreview: function( showFileWidgetIfNull ) {
        var value = this.element.val();
        if ( value && value != "" ) {
            var thumbnailUrl = getThumbnailUrl( value, 200, 200 );
            this.previewEl.html( "<img src='" + thumbnailUrl +"'>" );
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
