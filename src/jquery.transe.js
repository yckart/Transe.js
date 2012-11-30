/*!
 * jquery.transe.js 0.1 - https://github.com/yckart/transe
 * Transformable scroll elements!
 *
 * Inspired by John Polacek's Scrollorama
 *
 * Copyright (c) 2012 Yannick Albert (http://yckart.com)
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
 * 2012/11/21
**/
;(function($, window, document, undefined) {

    var pluginName = 'transe',
        defaults = {
            wrapper: $(window),
            fromElement: false,
            direction: 'vertical',
            start: 0,
            end: 0,
            property: '',
            before: 0,
            after: 0,
            easing: 'linear',
            scrollProperty: 'scroll',
            inview: function(elem){}
        },
        Plugin = function(elem, options) {
            this.elem = elem;
            this.$elem = $(elem);

            this.metadata = this.$elem.data(pluginName.toLowerCase() + '-options');
            this.options = $.extend({}, defaults, options, this.metadata);

            this.init();
        },
        addMethod = Plugin.prototype;

    addMethod.init = function() {

        this.slowBrowser = "ontouchend" in document || ($.browser.msie && Number($.browser.version) <= 8) ? true : false;

        this.scrollRange = this.options.end - this.options.start;

        // create objects before and after literal
        this.cssArgsBefore = {};
        this.cssArgsAfter = {};

        // assign the variable property for before and after
        this.cssArgsBefore[this.options.property] = this.options.before;
        this.cssArgsAfter[this.options.property] = this.options.after;

        // cache images for src changing
        this.cache = [];

        if (this.options.fromElement) {
            this._fromElement();
        }

        // this._transformIt();
        // this.options.wrapper.bind('scroll', function(){
        //     self._transformIt();
        // });
        this._startAnimationFrame();

        return this;
    };

    addMethod._vendorPrefix = (function() {
        var el = document.getElementsByTagName('script')[0],
            prefixes = ['Webkit', 'Moz', 'O', 'ms'];
        for (var i = 0; i < prefixes.length; i++) {
            if (prefixes[i] + "Transition" in el.style) {
                return '-' + prefixes[i].toLowerCase() + '-';
            }
        }
        return 'transform' in el.style ? '' : false;
    })();

    addMethod.scrollProperty = {
            scroll: {
                getTop: function($elem) { return $elem.scrollTop(); },
                setTop: function($elem, val) { $elem.scrollTop(val); },

                getLeft: function($elem) { return $elem.scrollLeft(); },
                setLeft: function($elem, val) { $elem.scrollLeft(val); }
            },
            position: {
                getTop: function($elem) { return parseInt($elem.css('top'), 10) * -1; },
                setTop: function($elem, val) { $elem.css('top', val); },

                getLeft: function($elem) { return parseInt($elem.css('left'), 10) * -1; },
                setLeft: function($elem, val) { $elem.css('left', val); }
            },
            margin: {
                getTop: function($elem) { return parseInt($elem.css('margin-top'), 10) * -1; },
                setTop: function($elem, val) { $elem.css('margin-top', val); },

                getLeft: function($elem) { return parseInt($elem.css('margin-left'), 10) * -1; },
                setLeft: function($elem, val) { $elem.css('margin-left', val); }
            },
            transform: {
                getTop: function($elem) { return ($elem.css(this._vendorPrefix + 'transform') !== 'none' ? parseInt($elem.css(this._vendorPrefix + 'transform').match(/(-?[0-9]+)/g)[5], 10) * -1 : 0); },
                setTop: function($elem, val) { setTransform($elem, val, 'Y'); },

                getLeft: function($elem) { return ($elem.css(this._vendorPrefix + 'transform') !== 'none' ? parseInt($elem.css(this._vendorPrefix + 'transform').match(/(-?[0-9]+)/g)[4], 10) * -1 : 0); },
                setLeft: function($elem, val) { setTransform($elem, val, 'X');  }
            }
        };

    addMethod._fromElement = function(){
        var startingElement = $(this.options.fromElement),
            startingElementOffset = startingElement.offset(),
            startingElementOffsetTop = startingElementOffset.top,
            startingElementOffsetLeft = startingElementOffset.left,

            windowWidth = this.options.wrapper.width(),
            windowHeight = this.options.wrapper.height();

        this.scrollFromTop = startingElementOffsetTop - windowHeight;
        this.scrollFromLeft = startingElementOffsetLeft - windowWidth;

        var onResize = function(){

            windowWidth = this.options.wrapper.width();
            windowHeight = this.options.wrapper.height();

        this.scrollFromTop = startingElementOffsetTop - windowHeight;
        this.scrollFromLeft = startingElementOffsetLeft - windowWidth;

        };
        window.onresize = onResize;
    };

    addMethod._transform = function(){

        if (this.options.property === 'transform') {

            this.before = this.options.before.split('(');
            this.after = this.options.after.split('(');

            // set css3 transform webkit and moz fallbacks
            this.cssArgsBefore[this.getVendor] = this.options.before;
            this.cssArgsAfter[this.getVendor] = this.options.after;

            // get int from css3 transform rotate and skew
            if (this.options.before.indexOf('deg') !== -1) {

                this.before = this.before[1].split('deg');
                this.before = parseFloat(this.before[0]);

                this.after = this.after[1].split('deg');
                this.after = parseFloat(this.after[0]);

            }
            // get int from css3 transform scale
            else if (this.options.before.indexOf('scale') !== -1) {

                this.before = this.before[1].split(')');
                this.before = parseFloat(this.before[0]);

                this.after = this.after[1].split(')');
                this.after = parseFloat(this.after[0]);

            }

        } else if (this.options.property === 'src') {

            var beforeFullPath = this.options.before.replace(/^url|[\(\)"']/g, ''),
                afterFullPath = this.options.after.replace(/^url|[\(\)"']/g, '');

            this.path = beforeFullPath.substr(0, beforeFullPath.lastIndexOf('/')) || beforeFullPath; // http://stackoverflow.com/a/1818400

            this.beforeFile = beforeFullPath.substring(beforeFullPath.lastIndexOf("/") + 1, beforeFullPath.lastIndexOf("."));
            this.afterFile = afterFullPath.substring(afterFullPath.lastIndexOf("/") + 1, afterFullPath.lastIndexOf("."));

            var extReg = /\.[^.]*$/;
            this.fileExt = extReg.exec(beforeFullPath);
            this.before = parseFloat(this.beforeFile);
            this.after = parseFloat(this.afterFile);
            this._preload();

        } else if (this.options.property === 'color' || this.options.property === 'backgroundColor') {

            // http://stackoverflow.com/a/7543829
            var rgbRegex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/;
                this.rgbBefore = rgbRegex.exec(this.options.before);
                this.rgbAfter = rgbRegex.exec(this.options.after);

        } else if (this.options.property === 'clip') {

            var clipReg = /^rect|[\(\)"']/g;
            this.clipBefore = this.options.before.replace(clipReg, '').split(' ');
            this.clipAfter = this.options.after.replace(clipReg, '').split(' ');

        }
    };

    addMethod._transformIt = function() {
        var self = this,
            scroll,
            currentCss = {};

        self._transform();

        if (this.options.direction === 'vertical') {
            //scroll = this.options.wrapper[0] === window ? (document.all ? document.documentElement.scrollTop : window.pageYOffset) : this.options.wrapper[0].scrollTop;
            scroll = this.scrollProperty[self.options.scrollProperty].getTop(self.options.wrapper);
            if (this.options.fromElement) {
                scroll = scroll - self.scrollFromTop;
            }
        } else if (this.options.direction === 'horizontal') {
            //scroll = this.options.wrapper[0] === window ? (document.all ? document.documentElement.scrollLeft : window.pageXOffset) : this.options.wrapper[0].scrollLeft;
            scroll = this.scrollProperty[self.options.scrollProperty].getLeft(self.options.wrapper);
            if (this.options.fromElement) {
                scroll = scroll - self.scrollFromLeft;
            }
        }

        var scrollPercentage = (scroll - this.options.start) / this.scrollRange;
        // Easing ability shamelessly stolen from Scrollorama | https://github.com/johnpolacek/scrollorama & Inspired by http://www.themealings.com.au/
        if (this.options.easing && $.isFunction($.easing[this.options.easing])) {
            scrollPercentage = $.easing[this.options.easing](scrollPercentage, scrollPercentage*1000, 0, 1, 1000);
        }

        // Fire the callback if object is in view
        if(scroll < this.options.end && scroll > this.options.start){
            this.options.inview(this.$elem);
        }

        if (scroll < this.options.start) {
            this.$elem.css(this.cssArgsBefore);
        } else if (scroll > this.options.end) {
            this.$elem.css(this.cssArgsAfter);
        } else {
            var currentTransform,
                currentTransformValue;

            if (this.options.property === 'transform') {
                currentTransformValue = self.before + (self.after - self.before) * scrollPercentage;

                if (this.options.before.indexOf('rotate') !== -1) {

                    if(!this.getVendor && document.getElementsByTagName('script')[0].style.filter === '') {

                        var cos = Math.cos(currentTransformValue * (Math.PI * 2 / 360)),
                            sin = Math.sin(currentTransformValue * (Math.PI * 2 / 360));

                        currentTransform = "progid:DXImageTransform.Microsoft.Matrix(M11="+cos+", M12="+(-sin)+", M21="+sin+", M22="+cos+", SizingMethod='auto expand')";

                        this.elem.style.marginLeft = -(this.elem.offsetWidth / 2) + (this.elem.clientWidth / 2) + "px";
                        this.elem.style.marginTop = -(this.elem.offsetHeight / 2) + (this.elem.clientHeight / 2) + "px";

                    } else {
                        currentTransform = 'rotate(' + currentTransformValue + 'deg)';
                    }

                } else if (this.options.before.indexOf('skew') !== -1) {
                    currentTransform = 'skew(' + currentTransformValue + 'deg)';
                } else if (this.options.before.indexOf('scale') !== -1) {

                    if(!this.getVendor && document.getElementsByTagName('script')[0].style.filter === '') {
                        currentTransform = "progid:DXImageTransform.Microsoft.Matrix(M11="+currentTransformValue+", M12=0, M21=0, M22="+currentTransformValue+", SizingMethod='auto expand')";
                    } else {
                        currentTransform = 'scale(' + currentTransformValue + ')';
                    }

                }

                currentCss[this.options.property] = currentTransform;
                currentCss[this.getVendor || 'filter'] = currentTransform;

                this.$elem.css(currentCss);

            } else if (this.options.property === 'src') {

                currentTransformValue = parseInt(self.before + (self.after - self.before) * scrollPercentage, 10);
                currentTransform = '' + self.path + '/' + currentTransformValue + self.fileExt + '';
                currentCss[this.options.property] = currentTransform;

                // if is slow browser use every 2nd image
                if(self.slowBrowser && currentTransformValue % 2 !== 0) {
                    this.$elem.attr(currentCss);
                } else if (!self.slowBrowser) {
                    this.$elem.attr(currentCss);
                }

            } else if (this.options.property === 'color' || this.options.property === 'backgroundColor' || this.options.property === 'borderColor') {

                var getColor = function(i, alpha) {
                    // 1 = red, 2 = blue, 3 = green, 4 = alpha
                    var rgb = self.rgbBefore[i] + (self.rgbAfter[i] - self.rgbBefore[i]) * scrollPercentage;
                    return !alpha ? parseInt(rgb, 10) : rgb;
                };

                if(isNaN(getColor(4, true))) {
                    currentTransform = 'rgb('+getColor(1)+','+getColor(2)+','+getColor(3)+')';
                } else {
                    currentTransform = 'rgba('+getColor(1)+','+getColor(2)+','+getColor(3)+','+getColor(4, true)+')';
                }

                currentCss[this.options.property] = currentTransform;
                this.$elem.css(currentCss);

            } else if (this.options.property === 'clip') {

                var getClip = function(i) {
                    // 1 = top, 2 = right, 3 = bottom, 4 = left
                    return parseInt(parseFloat(self.clipBefore[i]) + (parseFloat(self.clipAfter[i]) - parseFloat(self.clipBefore[i])) * scrollPercentage, 10);
                };

                currentTransform = 'rect('+getClip(0)+'px,'+getClip(1)+'px,'+getClip(2)+'px,'+getClip(3)+'px)';

                currentCss[this.options.property] = currentTransform;
                this.$elem.css(currentCss);

            } else {
                currentCss[this.options.property] = this.options.before + (this.options.after - this.options.before) * scrollPercentage;
                this.$elem.css(currentCss);
            }

        }

    };

    // Preload images if `src` property is used in options
    addMethod._preload = function() {
        var arr = [],
            args_len = this.afterFile,
            c = 0;
        for (var i = 1; i < args_len; i++) {
            arr.push(this.path+'/'+i+this.fileExt);
            var cacheImage = document.createElement('img');
            cacheImage.src = arr[c++];
            this.cache.push(cacheImage);
        }
    };

    // Start the `rfa` to request the "scroll" offsets
    addMethod._startAnimationFrame = function(){
        var self = this;
        (function(){var b=0;var c=["ms","moz","webkit","o"];for(var a=0;a<c.length&&!window.requestAnimationFrame;++a){window.requestAnimationFrame=window[c[a]+"RequestAnimationFrame"];window.cancelAnimationFrame=window[c[a]+"CancelAnimationFrame"]||window[c[a]+"CancelRequestAnimationFrame"]}if(!window.requestAnimationFrame){window.requestAnimationFrame=function(h,e){var d=new Date().getTime();var f=Math.max(0,16-(d-b));var g=window.setTimeout(function(){h(d+f)},f);b=d+f;return g}}if(!window.cancelAnimationFrame){window.cancelAnimationFrame=function(d){clearTimeout(d)}}}());
        (function animate() {
            self.req = requestAnimationFrame(animate);
            self.getScroll();
            self._transformIt();
        })();
    };

    // Public method to return scroll offset
    addMethod.getScroll = function() {
        return {
            x: this.scrollProperty[this.options.scrollProperty].getLeft(this.options.wrapper),
            y: this.scrollProperty[this.options.scrollProperty].getTop(this.options.wrapper)
        };
    };

    // Publio method to destroy plugin instances
    addMethod.destroy = function() {
      this.$elem.each(function() {
        $(this).removeData('plugin_' + pluginName).removeAttr('style');
      });
      cancelAnimationFrame(this.req);
    };

    // Public method to set options after instantiation
    addMethod.option = function(key, val) {
        if (val) {
            this.options[key] = val;
        } else if (key) {
            return this.options[key];
        }
    };

    $.fn[pluginName] = function(options) {
        var args = arguments;
        if (options === undefined || typeof options === 'object') {
            return this.each(function() {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            var returns;
            this.each(function() {
                var instance = $.data(this, 'plugin_' + pluginName);
                if (instance instanceof Plugin && typeof instance[options] === 'function') {
                    returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                }
            });
            return returns !== undefined ? returns : this;
        }
    };

    $[pluginName] = function (options) {
         // override the defaults for all plugin calls.
         $.extend(defaults, options);
    };

})(window.jQuery || window.Zepto, window, document);