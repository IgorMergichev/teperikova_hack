jQuery.widget('gc.phoneField', $.gc.stringField, {

    //build: function () {
    //    $.gc.stringField.prototype.build.call(this);
    //    this.inputCodeBlock = $('<span class="hide"><span class="input"></span>Получить код</span>');
    //    //this.inputCode = $('<input type="text" name="code" placeholder="Введите код подтверждения"/>');
    //    this.inputBlock.find('input').after(this.inputCodeBlock);
    //    //this.inputCodeBlock.find('.input').append(this.inputCode);
    //    //var that = this;
    //    //this.input.keyup(function (event) {
    //    //    if ($(this).val().length > 0) {
    //    //        that.inputCodeBlock.removeClass('hide');
    //    //    }
    //    //    else {
    //    //        that.inputCodeBlock.addClass('hide');
    //    //    }
    //    //});
    //},
    //getValue: function () {
    //    return [
    //        this.input.val()
    //        //,this.inputCode.val()
    //    ].join(':');
    //},
});