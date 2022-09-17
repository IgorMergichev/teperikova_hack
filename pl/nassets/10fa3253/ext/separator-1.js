(function ($, window, document, undefined) {

    /** Default values */
    var pluginName = 'mediumInsert',
        addonName = 'Separator', // first char is uppercase
        defaults = {
        };

    /**
     * Separator addon
     *
     * Sets options, variables and calls init() function
     *
     * @constructor
     * @param {DOM} el - DOM element to init the plugin on
     * @param {object} options - Options to override defaults
     * @return {void}
     */

    function Separator (el, options) {
        this.el = el;
        this.$el = $(el);
        this.templates = window.MediumInsert.Templates;
        this.core = this.$el.data('plugin_'+ pluginName);

        this.options = $.extend(true, {}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    /**
     * Initialization
     *
     * @return {void}
     */

    Separator.prototype.init = function () {
        //this.events();
        //this.backwardsCompatibility();
        //this.sorting();
    };

    Separator.prototype.add = function () {
        var $place = this.$el.find('.medium-insert-active'),
            that = this,
            reader;

        if ($place.is('p')) {
            $place.replaceWith('<hr class="medium-more-link"/>');

            this.core.hideButtons();
        }
    };


    /** Plugin initialization */

    $.fn[pluginName + addonName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName + addonName)) {
                $.data(this, 'plugin_' + pluginName + addonName, new Separator(this, options));
            }
        });
    };

})(jQuery, window, document);