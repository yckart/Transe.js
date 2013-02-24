/*!
 * jquery.transe.js 2.0.2 - https://github.com/yckart/jQuery.transe.js
 * Transformable scroll elements!
 *
 * Inspired by John Polacek's Scrollorama
 *
 * Copyright (c) 2012 Yannick Albert (http://yckart.com)
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
 * 2013/01/18
 */
;(function ($, TweenLite, window, undefined) {
    "use strict";

    var pluginName = 'transe',
        defaults = {
            start: 0,
            end: 0,
            css: '',
            from: '',
            to: '',
            container: $(window),
            direction: 'y',
            offsetter: 'scroll',
            tween: {
                use: false,
                speed: 1,
                ease: ''
            },
            easing: 'linear',

            isHidden: $.noop,
            isVisible: $.noop
        },
        Helpers = {
            getUnit: function(val) { return (/[0-9]+([^ ,\)]*)(,*)/).exec(val); },
            getIdentifier: function(matrix){ return matrix.split('('); },
            matrixToArray: function(matrix){ return matrix.slice(matrix.indexOf('(') + 1, matrix.indexOf(')')).split(','); }
        },
        scrollProperty = {
            scroll: {
                y: function($elem) { return $elem.scrollTop(); },
                x: function($elem) { return $elem.scrollLeft(); }
            },
            position: {
                y: function($elem) { return parseFloat($elem.css('top')) * -1; },
                x: function($elem) { return parseFloat($elem.css('left')) * -1; }
            },
            margin: {
                y: function($elem) { return parseFloat($elem.css('marginTop')) * -1; },
                x: function($elem) { return parseFloat($elem.css('marginLeft')) * -1; }
            },
            transform: {
                y: function($elem) { return ($elem.css('transform') !== 'none' ? parseFloat(Helpers.matrixToArray($elem.css('transform'))[5]) * -1 : 0); },
                x: function($elem) { return ($elem.css('transform') !== 'none' ? parseFloat(Helpers.matrixToArray($elem.css('transform'))[4]) * -1 : 0); }
            }
        };


    function Plugin(elem, options){
        this.elem = elem;
        this.$elem = $(elem);

        this.meta = this.$elem.data(pluginName + '-options');
        this.options = $.extend({}, defaults, options, this.meta);

        this._init();
    }

    Plugin.prototype = {
        _init: function(){
            this.valBefore = [];
            this.valAfter = [];

            // create objects before and after literal
            this.cssArgsBefore = {};
            this.cssArgsAfter = {};

            this.isImage = this.options.css === 'backgroundImage';
            this.isColor = (this.options.css === 'color' || this.options.css === 'backgroundColor' || this.options.css === 'borderColor' || this.isImage);

            this._beforeAfter();
            this._animFrame();
        },

        _beforeAfter: function(){
            var self = this;

            // assign the variable property for before and after
            if ( isNaN( Number(this.options.from) ) ) {
                this.matrixBefore = Helpers.matrixToArray(this.options.from);
                this.matrixAfter = Helpers.matrixToArray(this.options.to);

                $.each(this.matrixBefore, function (i) {
                    self.valBefore.push(self.matrixBefore[i] + Helpers.getUnit(self.options.from)[1]);
                    self.valAfter.push(self.matrixAfter[i] + Helpers.getUnit(self.options.to)[1]);
                });

                this.cssArgsBefore[this.options.css] = Helpers.getIdentifier(this.options.from)[0] + '(' + this.valBefore + ')';
                this.cssArgsAfter[this.options.css] = Helpers.getIdentifier(this.options.to)[0] + '(' + this.valAfter + ')';
            } else {
                this.cssArgsBefore[this.options.css] = this.options.from;
                this.cssArgsAfter[this.options.css] = this.options.to;
            }
        },

        _transeIt: function(){
            var self = this,
                currentCss = {},
                scrollRange = this.options.end - this.options.start;

            // get the scroll-offset based on which option is choosed, if a number is passed it 'll use this
            this.scroll = !isNaN( Number(this.options.offsetter) ) ? Number(this.options.offsetter) : scrollProperty[this.options.offsetter][this.options.direction](this.options.container);

            // calculate the scroll-percentage
            var scrollPercentage = (this.scroll - this.options.start) / scrollRange;

            // Easing ability shamelessly stolen from Scrollorama
            // https://github.com/johnpolacek/scrollorama & Inspired by http://www.themealings.com.au/
            if (this.options.easing && $.isFunction($.easing[this.options.easing])) {
                scrollPercentage = $.easing[this.options.easing](scrollPercentage, scrollPercentage * 1000, 0, 1, 1000);
            }

            if (this.scroll < this.options.start) {
                if (this.options.tween.use) {
                    TweenLite.to(this.elem, this.options.tween.speed, {css: this.cssArgsBefore, ease: this.options.tween.ease});
                } else {
                    this.$elem.css(this.cssArgsBefore);
                }

            } else if (this.scroll > this.options.end) {

                if (this.options.tween.use) {
                    TweenLite.to(this.elem, this.options.tween.speed, {css: this.cssArgsAfter, ease: this.options.tween.ease});
                } else {
                    this.$elem.css(this.cssArgsAfter);
                }

                this.options.isHidden(this.elem);

            } else {

                if (isNaN(Number(this.options.from))) {

                    var vals = [];
                    $.each(this.valAfter, function (i) {
                        var out = parseFloat(self.valBefore[i]) + (parseFloat(self.valAfter[i]) - parseFloat(self.valBefore[i])) * scrollPercentage + Helpers.getUnit(self.valBefore[i])[1];
                        vals.push(self.isColor ? parseInt(out, 10) : out);
                    });

                    if(this.isImage){
                        currentCss[this.options.css] = Helpers.getIdentifier(this.options.from)[0] + '(' + vals + Helpers.getUnit(this.options.from)[1] + ')';
                    } else {
                        currentCss[this.options.css] = Helpers.getIdentifier(this.options.from)[0] + '(' + vals + ')';
                    }

                } else {
                    currentCss[this.options.css] = parseFloat(this.options.from) + (parseFloat(this.options.to) - parseFloat(this.options.from)) * scrollPercentage;
                }

                if (this.options.tween.use) {
                    TweenLite.to(this.elem, this.options.tween.speed, {css: currentCss, ease: this.options.tween.ease});
                } else {
                    this.$elem.css(currentCss);
                }

                this.options.isVisible(this.elem);
            }
        },

        _animFrame: function(){
            var self = this;

            // rAF.js polyfill | https://gist.github.com/3371337
            (function(c){var b="equestAnimationFrame",f="r"+b,a="ancelAnimationFrame",e="c"+a,d=0,h=["moz","ms","o","webkit"],g;while(!c[f]&&(g=h.pop())){c[f]=c[g+"R"+b];c[e]=c[g+"C"+a]||c[g+"CancelR"+b]}if(!c[f]){c[f]=function(l){var k=+new Date,i=16-(k-d),j=i>0?i:0;d=k+j;return setTimeout(function(){l(d)},j)};c[e]=clearTimeout}}(window));

            (function loop() {
                // don't call `_transeIt()` if the content wasn't moved
                if( ( !isNaN(Number(self.options.offsetter)) ? Number(self.options.offsetter) : scrollProperty[self.options.offsetter][self.options.direction](self.options.container) ) !== self.scroll) self._transeIt();
                self.req = requestAnimationFrame(loop);
            })();

        },

        destroy: function(){
            this.$elem.removeData('plugin_' + pluginName).css(this.options.css, '');
            this.$elem = null;
            cancelAnimationFrame(this.req);
        },

        option: function(key, val) {
            if (val) {
                this.options[key] = val;
            } else if (key) {
                return this.options[key];
            }
        }
    };



    $[pluginName] = $.fn[pluginName] = function (options) {
        var args = arguments,
            returns;

        if (!(this instanceof $)) {
            if($.isArray(options)){
                for (var i = 0; i < options.length; i += 2) {
                    $.fn[pluginName].call($(options[i]), options[i+1]);
                }
            } else {
                // override the plugin defaults/options for all plugin calls globally
                $.extend(defaults, options);
            }
        }

        this.each(function() {
            var instance = $.data(this, 'plugin_' + pluginName);
            if (typeof options === 'string' && options[0] !== '_') {
                if (instance instanceof Plugin && typeof instance[options] === 'function') {
                    returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                }
            } else {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });
        return returns === undefined ? this : returns;
    };

})(jQuery, window.TweenLite, window);
