$( function() {

    var BlogPostPanel = React.createClass({displayName: "BlogPostPanel",
        getInitialState: function() {
            return {
                blogPostId: this.props.blogPostId,
                editing: this.props.editing,
                loaded: false,
                post: {},
                canModify: false,
                canModerate: false
            };
        },
        loadState: function( first ) {
            var self = this;

            ajaxCall("/pl/cms/blog/get-post-status/?id=" + this.state.blogPostId, {}, {}, function (response) {
                var state = self.state;
                state.canModify = response.can_modify;
                state.canModerate = response.can_moderate;
                state.post = response.post;
                state.loaded = true;
                self.setState(state);
                if ( first && state.editing ) {
                    self.initEditors();
                }
                if ( ! state.canModify ) {
                    //console.log( self.findDOMNode() )
                    $( self.getDOMNode() ).parent().hide();
                }
                else {
                    $( self.getDOMNode() ).parent().show();
                }
            });
        },
        componentDidMount: function() {
            this.loadState( true );
        },
        initEditors: function() {
            this.contentEditor = new MediumEditor('.xdget-blogPostContent', {
                placeholder: "Введите текст"
                ,buttons: [
                    'bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote', 'unorderedlist'
                ],
                targetBlank: false
            });

            $blogPostContnetEl = $('.xdget-blogPostContent');

            $blogPostContnetEl.addClass( "editing" );

            $('.xdget-blogPostSystemPage').addClass("editing");


            $blogPostContnetEl.mediumInsert({
                editor: this.contentEditor,
                placeholder: "Введите текст записи",
                addons: { // (object) Addons configuration
                    images: {
                        uploadScript: '/pl/fileservice/widget/upload-image', // (string) A relative path to an upload script
                        preview: false,
                        captionPlaceholder: "Введите описание"
                    },
                    separator: {
                        label: "<span class='fa fa-ellipsis-h'></span>"
                    }
                }

            } );

            this.titleEditor = new MediumEditor('.xdget-blogPostTitle', {
                placeholder: "Введите заголовок",
                disableReturn: true,
                disableToolbar: true
            });

            $blogPostContnetEl.focus();
        },
        handleSaveClick: function( e ) {

            if ( ! this.contentEditor ) {
                return;
            }

            var params = {};
            var attribute = null;

            var data = this.contentEditor.serialize();
            for( key in data ) {
                attribute = $('#' + key ).data('blog-post-attribute');
                if ( attribute ) {
                    params[attribute] = data[key].value;
                }
            }

            data = this.titleEditor.serialize();
            for( key in data ) {
                attribute = $('#' + key ).data('blog-post-attribute');
                if ( attribute ) {
                    params[attribute] = data[key].value;
                }
            }

            var self = this;
            ajaxCall( "/pl/cms/blog/update-data?id=" + this.state.blogPostId, { Ugc: params }, {}, function( response ) {

                var state = self.state;

                if (  ! state.blogPostId && response.link ) {
                    window.history.pushState({}, "", response.link );
                }
                state.blogPostId = response.id;

                self.setState(state);
            } );
        },
        handleEditClick: function( e ) {
            state = this.state;

            if ( state.post.version == 0 ) {
                window.location.href = "/pl/cms/ugc/update?id=" + state.blogPostId + "&noRedirect=1";
                return;
            }

            state.editing = ! state.editing;
            this.setState( state );

            if( state.editing && ! this.setuped ) {
                this.setuped = true;
                this.initEditors();


                //this.contentEditor.selectAllContents();

            }
        },
        handleChangeStatusClick: function( newStatus ) {
            var self = this;
            if ( confirm( "Вы действительно хотите изменить статус поста?" ) ) {
                ajaxCall( "/pl/cms/blog/change-status?id=" + this.state.blogPostId , { new_status: newStatus }, {}, function( res ) {
                    self.loadState();
                } );
            }
        },
        handleCancelClick: function() {
            window.history.back();
        },
        handleDeleteClick: function( e ) {
            if ( confirm( "Вы действительно удалить этот пост?" ) ) {
                ajaxCall( "/pl/cms/blog/delete-post?id=" + this.state.blogPostId , { 'do_delete': true }, {}, function( res ) {
                    if ( res.redirect_to ) {
                        window.location.href = res.redirect_to;
                    }
                } );
            }
        },
        handleViewClick: function() {
            window.open( "/pl/cms/blog/post/" + this.state.blogPostId, "show" );
        },
        handleParamsClick: function() {
            window.open( "/pl/cms/ugc/update?id=" + this.state.blogPostId, "params" );
        },
        render: function() {
            if ( ! this.state.loaded ) {
                return ( React.createElement("div", null) );
            }

            var post = this.state.post;
            if ( ! post || ! this.state.canModify ) {
                return ( React.createElement("div", null) );
            }

            var statusLabelClass = "label label-" + this.state.post.status_class;

            var editBtnClass = "btn btn-default btn-sm btn-block ";
            var editButtons = "";
            if ( this.state.editing ) {
                editBtnClass += " hidden";

                var settingsBtn = "";
                if ( this.state.canModerate ) {
                    settingsBtn = (
                        React.createElement("div", {className: "btn-group btn-block", role: "group"},
                            React.createElement("button", {onClick: this.handleParamsClick, className: "btn btn-sm btn-link btn-block"},
                                React.createElement("span", {className: "fa fa-wrench"}), " Настройки"
                            )
                        )
                    );
                }


                var changeStatusBtn = "";
                switch ( post.status ) {
                    case "draft":
                        if ( this.state.canModerate ) {
                            changeStatusBtn = (
                                React.createElement("button", {onClick: this.handleChangeStatusClick.bind(this, "published"), className: "btn btn-publish btn-block btn-primary btn-sm"},
                                    React.createElement("span", {className: "fa fa-thumbs-up"}), " Опубликовать"
                                )
                            );                    }
                        else {
                            changeStatusBtn = (
                                React.createElement("button", {onClick: this.handleChangeStatusClick.bind(this, "on_moderation"), className: "btn btn-publish btn-block btn-warning btn-sm"},
                                    React.createElement("span", {className: "fa fa-check"}), " На модерацию"
                                )
                            );
                        }
                        break;
                    case "on_moderation":

                        if ( this.state.canModerate ) {
                            changeStatusBtn = (
                                React.createElement("button", {onClick: this.handleChangeStatusClick.bind(this, "published"), className: "btn btn-publish btn-block btn-primary btn-sm"},
                                    React.createElement("span", {className: "fa fa-thumbs-up"}), " Опубликовать"
                                )
                            );
                        }
                        else {
                            changeStatusBtn = (
                                React.createElement("button", {onClick: this.handleChangeStatusClick.bind(this, "draft"), className: "btn btn-publish btn-block btn-sm"},
                                    React.createElement("span", {className: "fa fa-eye-slash"}), " Сделать черновиком"
                                )
                            );
                        }

                        break;
                    case "published":

                        if ( this.state.canModerate ) {
                            changeStatusBtn = (
                                React.createElement("button", {onClick: this.handleChangeStatusClick.bind(this, "draft"), className: "btn btn-publish btn-block btn-sm"},
                                    React.createElement("span", {className: "fa fa-eye-slash"}), " Сделать черновиком"
                                )
                            );
                        }
                        break;
                }

                var cancelBtn = "";
                var existsPostButtons = "";
                if ( this.state.blogPostId ) {
                    existsPostButtons = (
                        React.createElement("div", {className: "exists-post-buttons"},

                            React.createElement("button", {onClick: this.handleViewClick, className: "btn btn-sm btn-default btn-block"},
                                React.createElement("span", {className: "fa fa-eye"}), " Просмотр"
                            ),
                            changeStatusBtn,
                            React.createElement("button", {onClick: this.handleDeleteClick, className: "btn btn-publish btn-block btn-danger btn-sm"},
                                React.createElement("span", {className: "fa fa-trash"}), " Удалить пост"
                            ),


                            settingsBtn
                        )
                    );
                } else {
                    cancelBtn = (
                        React.createElement("button", {onClick: this.handleCancelClick, className: "btn btn-default btn-sm btn-block"},
                            React.createElement("span", {className: "fa fa-arrow-left"}), " Отмена"
                        )
                    );
                }

                editButtons = (
                    React.createElement("div", {className: "edit-buttons"},
                        existsPostButtons,
                        React.createElement("button", {onClick: this.handleSaveClick, className: "btn btn-success btn-block btn-save"},
                            React.createElement("span", {className: "fa fa-save"}), " Сохранить"
                        )
                    )
                );
            }

            var currentState = "";
            if ( this.state.post.status_label ) {
                currentState = (
                    React.createElement("div", {className: "field text-center"},
                        "Текущий статус ", React.createElement("br", null), React.createElement("span", {className: statusLabelClass}, this.state.post.status_label)
                    )
                );
            }

            return (
                React.createElement("div", null,
                    currentState,
                    cancelBtn,
                    React.createElement("button", {className: editBtnClass, onClick: this.handleEditClick},
                        React.createElement("span", {className: "fa fa-pencil"}), " Редактировать"
                    ),

                    editButtons
                )
            );
        }
    } );

    var $blogPostSystemPageEl = $('.xdget-blogPostSystemPage');
    if ( $blogPostSystemPageEl.length > 0 ) {
        var blogPostId = $blogPostSystemPageEl.data('blog-post-id');

        var editing = false;
        if ( blogPostId == "" ) {
            editing = true;
        }

        $panel = $('<div id="blogPostPanel" class="blog-post-panel"/>');
        $panel.appendTo(document.body);
        $panel.hide();
        React.render(
            React.createElement(BlogPostPanel, {editing: editing, blogPostId: blogPostId}), document.getElementById('blogPostPanel')
        );
    }



} );
