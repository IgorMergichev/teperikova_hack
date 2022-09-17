jQuery.widget( 'gc.socialSharePlugin', {
  options: {
    services: ["vk","facebook","twitter"].filter((service) => service != 'vk' || !window.isDisabledVK),
    sizeClass: ""
  },
  _create: function() {
    var self = this;
    var sizeClass = this.element.data("size-class")
    this.image = this.element.data("image")
    this.title = this.element.data("title")

    if ( ! sizeClass ) {
      sizeClass = ""
    }
    for ( key in this.options.services ) {
      var service = this.options.services[key]
      if (service === 'facebook' && window.isDisabledFacebook === true) {
        continue;
      }
      $link = $('<a class="btn ' + sizeClass + ' btn-social-icon btn-' + service + '">' +
          '<span class="fa fa-' + service + (service === 'facebook' && window.isModifiedFacebookButton === true ? '-modified' : '') + '">' + (service === 'facebook' && window.isModifiedFacebookButton === true ? 'FB' : '') + '</span>' +
          '</a>' )
      $link.appendTo( this.element );
      $link.data('service', service)

      $link.click( function() {
        self.popup( self.getLink( $(this).data('service') ) )
      })
    }
  },
  getLink: function( service ) {
    //var purl = $('meta[property="og:url"]').attr("content");
    var ptitle = this.title ? this.title : $('meta[property="og:title"]').attr("content");
    var text = $('meta[property="og:description"]').attr("content");
    var pimg = this.image ? this.image : $('meta[property="og:image"]').attr("content");
    var appid = $('meta[property="fb:app_id"]').attr("content");

    var purl = location.protocol + "//" + location.hostname + location.pathname;
    if ( window.shareUrlAppend ) {
      purl = purl + window.shareUrlAppend;
    }
    if ( ! ptitle ) ptitle = document.title;
    //alert(ptitle)
    if ( ! text ) text = "";
    if ( ! pimg ) pimg = "";
    if ( ! appid ) appid = "";

    if ( window.shareTitle ) {
      ptitle = window.shareTitle;
    }
    if ( window.customShareUrl ) {
      purl = window.customShareUrl;
    }
    if ( window.customShareTitle ) {
      ptitle = window.customShareTitle;
    }
    if ( window.customShareImage ) {
      pimg = window.customShareImage;
    }
    if ( window.customShareDescription ) {
      text = window.customShareDescription;
    }

    let url = '';
    switch ( service ) {
      case "vk":
        url = 'http://vkontakte.ru/share.php?';
        url += 'url=' + encodeURIComponent(purl);
        url += '&title=' + encodeURIComponent(ptitle);
        //url += '&description=' + encodeURIComponent(text);
        url += '&image=' + encodeURIComponent(pimg);
        url += '&noparse=true';
        break;
      case "facebook":
        url  = 'http://www.facebook.com/sharer.php?s=100';
        url += '&u='       + encodeURIComponent(purl);
        url += '&app_id='       + encodeURIComponent(appid);
        url += '&p[title]='     + encodeURIComponent(ptitle);
        url += '&p[summary]='   + encodeURIComponent(text);
        url += '&p[url]='       + encodeURIComponent(purl);
        url += '&p[images][0]=' + encodeURIComponent(pimg);
        break;
      case "ok":
        url  = 'http://www.odnoklassniki.ru/dk?st.cmd=addShare&st.s=1';
        url += '&st.comments=' + encodeURIComponent(text);
        url += '&st._surl='    + encodeURIComponent(purl);
        break;
      case "twitter":
        url  = 'http://twitter.com/share?';
        url += 'text='      + encodeURIComponent(ptitle);
        url += '&url='      + encodeURIComponent(purl);
        url += '&counturl=' + encodeURIComponent(purl);
        break;
      case "mailru":
        url  = 'http://connect.mail.ru/share?';
        url += 'url='          + encodeURIComponent(purl);
        url += '&title='       + encodeURIComponent(ptitle);
        url += '&description=' + encodeURIComponent(text);
        url += '&imageurl='    + encodeURIComponent(pimg);
        break;
    }
    return url;
  },
  popup: function( url ) {
      window.open(url,'','toolbar=0,status=0,width=626,height=436');
  }
} );


$( function() {
  $('.gc-share-links').socialSharePlugin();
})
