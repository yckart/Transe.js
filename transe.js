(function ($, window, document) {



    /* CONSTANTS
    =============== */
    var HTML = document.documentElement;
    var BODY = document.body;
    var PARSER = {};



    /* DEFAULTS
    =============== */
    var defaults = {
        inner: window,
        outer: document,
        axis: 'y',
        offsetter: 'scroll',
        autoresize: true,
        forcesize: true,
        easing: function linear(x, t, b, c, d) {
            return c * t / d + b;
        },

        render: function (elem, css, offset) {},
        beforeRender: function (elem, css, offset) {}
    };



    /* FEATURE DETECTION
    ==================== */
    var hasRGBA = (function () {
        var style = document.createElement('div').style;
        try { style.backgroundColor = 'rgba(0,0,0,0.6)'; } catch (e) {}
        return style.backgroundColor.indexOf('rgba') !== -1;
    }());



    /* HELPERS
    ==================== */

    // map a number from one range to another
    // https://github.com/1am/Dashboard/blob/master/src/utils.js
    var val = function (start, end, pos) {
        if (end > start) return start + (end - start) * pos;
        if (start > end) return -(start - end) * (pos - 1) + end;
        return start;
    };



    /**
     * Some helper functions
     * @api public
     */
    var Helpers = {
        val: val,
        isNode: function (elem) {
            return elem instanceof Element;
        },
        getUnit: function (val) {
            return (/[0-9]+([^ ,\)]*)(,*)/).exec(val);
        },
        getIdent: function (matrix) {
            return matrix.split('(')[0];
        },
        matrixToArray: function (matrix) {
            return matrix.split('(')[1].split(')')[0].split(',');
        },
        percentToRange: function (perc, min, max) {
            return (max - min) * (perc / 100 + min);
        }
    };



    /**
     * Return a css property
     * mapped to a potentially vendor prefixed property
     *
     * @param {Object} style
     * @param {String} prop
     * @see jQuery core
     * @api private
     */
    var prefixed = (function () {
        var cssPrefixes = ['Webkit', 'O', 'Moz', 'ms'];
        var len = cssPrefixes.length;

        return function (style, prop) {

            // shortcut for names that are not vendor prefixed
            if (typeof style[prop] !== 'undefined') return prop;

            // check for vendor prefixed names
            var capProp = prop.charAt(0).toUpperCase() + prop.slice(1),
                origProp = prop,
                i = len;

            while (i--) {
                if (typeof style[prop = cssPrefixes[i] + capProp] !== 'undefined') return prop;
            }

            return origProp;
        };

    }());



    /**
     * Get and set the style property on a DOM Node
     *
     * @param {Node|NodeList} elems
     * @param {Object} style
     * @api private
     */
    var css = (function () {
        var noUnit = /columnCount|fillOpacity|fontWeight|lineHeight|opacity|order|orphans|widows|zIndex|zoom/i;
        var style;

        return function (elems, css) {

            if (!elems[0]) elems = [elems];
            for (var i = 0, elem; (elem = elems[i++]);) {

                if (typeof css === 'string') {
                    style = window.getComputedStyle ? getComputedStyle(elem, null) : elem.currentStyle;
                    return style[prefixed(style, css)];
                }

                style = elem.style;
                for (var prop in css) {
                    style[prefixed(style, prop)] =
                        css[prop] + (!noUnit.test(prop) && !isNaN(css[prop] - 0) ? 'px' : '');
                }
            }
        };

    }());



    /**
     * Returns the actual document size
     *
     * @param {String} method
     * @api private
     */
    var outerSize = function (method) {
        var scroll = 'scroll' + method;
        var offset = 'offset' + method;
        var client = 'client' + method;
        return Math.max(
            BODY[scroll], HTML[scroll],
            BODY[offset], HTML[offset],
            BODY[client], HTML[client]
        );
    };



    /**
     * Returns the actual window size
     *
     * @param {String} method
     * @api private
     */
    var innerSize = function (method) {
        var inner = 'inner' + method;
        var client = 'client' + method;
        return window[inner] || HTML[client] || BODY[client];
    };



    /**
     * Some helpers to get sizes and scroll offset
     *
     * @api private
     */
    var get = {

        // dimensions
        innerSize: {
            x: function (elem) { return Helpers.isNode(elem) ? elem.clientWidth : innerSize('Width'); },
            y: function (elem) { return Helpers.isNode(elem) ? elem.clientHeight : innerSize('Height'); }
        },
        outerSize: {
            x: function (elem) { return Helpers.isNode(elem) ? elem.scrollWidth : outerSize('Width'); },
            y: function (elem) { return Helpers.isNode(elem) ? elem.scrollHeight : outerSize('Height'); }
        },



        // scroll properties
        scroll: {
            y: function (elem) { return Helpers.isNode(elem) ? elem.scrollTop : (HTML.scrollTop || BODY.scrollTop); },
            x: function (elem) { return Helpers.isNode(elem) ? elem.scrollLeft : (HTML.scrollLeft || BODY.scrollLeft); },
        },
        position: {
            y: function (elem) { return parseFloat(css(elem, 'top')) * -1; },
            x: function (elem) { return parseFloat(css(elem, 'left')) * -1; }
        },
        margin: {
            y: function (elem) { return parseFloat(css(elem, 'marginTop')) * -1; },
            x: function (elem) { return parseFloat(css(elem, 'marginLeft')) * -1; }
        },
        transform: {
            y: function (elem) { var transform = css(elem, 'transform'); return transform !== 'none' || !transform ? Helpers.matrixToArray(transform)[5] * -1 : 0; },
            x: function (elem) { var transform = css(elem, 'transform'); return transform !== 'none' || !transform ? Helpers.matrixToArray(transform)[4] * -1 : 0; }
        }
    };



    /**
     * Crossbrowser event handling
     *
     * @param {Node} elem
     * @param {String} event
     * @param {Function} handler
     *
     * @api private
     */
    var on = function (elem, event, handler) {
        if (elem.addEventListener) {
            elem.addEventListener(event, handler, false);
        } else if (elem.attachEvent) {
            elem.attachEvent('on' + event, handler);
        }
    };



    /**
     * Converts a string to rgb/a values
     *
     * @param {String/Array} color
     * @return {Array} [r, g, b, a]
     */
    var parseColor = (function () {

        var match;

        // #aabbcc
        var hheexx = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/;

        // #abc
        var hex = /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/;

        // rgb(n, n, n)
        var rgb = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/;

        // No browser returns rgb(n%, n%, n%), so little reason to support this format.
        var rgba = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9\.]*)\s*\)/;

        return function (color) {
            if (color instanceof Array) return color;

            if (match = hheexx.exec(color))
                return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16), 1];

            if (match = hex.exec(color))
                return [parseInt(match[1], 16) * 17, parseInt(match[2], 16) * 17, parseInt(match[3], 16) * 17, 1];

            if (match = rgb.exec(color))
                return [match[1] | 0, match[2] | 0, match[3] | 0, 1];

            if (match = rgba.exec(color))
                return [match[1] | 0, match[2] | 0, match[3] | 0, parseFloat(match[4])];

            return false;
        };
    }());



    /**
     * Clone/Merge an object
     *
     * @param {Object} obj
     * @param {Object} [target]
     *
     * @api private
     */
    var clone = function (obj, target) {
        target = target || {};
        for (var key in obj) {
            target[key] = obj[key];
        }
        return target;
    };



    /**
     * Iterate over all properties
     * and populate the missing properties
     * with the css-values from a DOM-Node.
     *
     * @param {Node} elem
     * @param {Object} keyframe
     * @api private
     */
    var populate = function (elem, keyframe) {
        var frame, key;
        var all = {};

        for (frame in keyframe) {
            for (key in keyframe[frame]) {
                var prop = css(elem, key);
                var propP = parseFloat(prop);
                all[key] = propP === propP ? propP : prop;
            }
        }

        for (frame in keyframe) {
            var obj = keyframe[frame];
            for (key in all) {
                if (key in obj)
                    all[key] = obj[key];
                else
                    obj[key] = all[key];
            }
        }

        return keyframe;
    };



    /**
     * The "class" constructor
     *
     * @param {Object} [options] The plugin defaults
     * @param {Node|String} [options.inner=window] The element to get window sizes
     * @param {Node|String} [options.outer=document] The wrapper element to get the document sizes
     * @param {String} [options.axis='y'] The scroll-direction can be either 'x' or 'y'
     * @param {String} [options.offsetter='scroll'] The scroll property which gets the scroll offset
     * @param {Boolean|Number} [options.autoresize=true] Re-parse the keyframes object on resize
     * @param {String|Function} [options.easing] An easing function or a string (which is available via jQuery.easing)
     *
     * @constructor
     * @api public
     */

    function Transe(options) {
        this.map = {};
        this.options = clone(options || {}, defaults);

        this.inner = Helpers.isNode(this.options.inner) ? this.options.inner : BODY;
        this.innerSize = get.innerSize[this.options.axis](this.options.outer);
        this.outerSize = get.outerSize[this.options.axis](this.options.outer);

        // if there's no size
        if (this.outerSize - this.innerSize < this.innerSize) this.outerSize = this.innerSize * 2;
    }



    /**
     * Class initialization
     * @api private
     */
    Transe.prototype._init = function () {
        var self = this;

        // start the scroll loop, or add scroll-event
        if (this.options.offsetter === 'scroll') {
            on(this.options.inner, 'scroll', function () {
                self.scroll();
            });
        } else {
            (function loop() {
                if (self._getScroll() !== self.scrollOffset) self.scroll();
                setTimeout(loop, 10);
            }());
        }

        // triggers the scroll method
        this.scroll();

        // prepare autoresizing
        var autoresize = this.options.autoresize;
        if (autoresize) {
            var resizeTimer;
            on(window, 'resize', function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function () {
                    self.refresh();
                }, typeof autoresize === 'boolean' ? 100 : autoresize);
            });
        }
    };



    /**
     * The scroll method
     * transforms the elements based on the scroll offsett
     *
     * @param {Number|String} [offset] A setter if we need to set the scroll offset manually
     * @api public
     * @event
     */
    Transe.prototype.scroll = function (offset) {
        this.scrollOffset = this._getScroll(offset);

        var offsets = this.keys;
        var len = offsets.length;

        // get the actual keyframe index
        for (var i = len; --i;) {
            if (this.scrollOffset > offsets[i-1] && this.scrollOffset <= offsets[i]) {
                break;
            }
        }

        // get the actual matching keyframe
        var match = parseFloat(offsets[i]);

        for (var id in this.map) {
            var map = this.map[id];
            var elem = map.elem;
            var cssObj = map.frames[this.scrollOffset];

            this.options.beforeRender.call(this, match, elem, cssObj);
            css(elem, cssObj);
            this.options.render.call(this, match, elem, cssObj);
        }
    };



    /**
     * Add keyframes to our instance
     *
     * @param {Object} keyframes The keyframes object
     * @param {String|Node} keyframes.<selector> A querySelector or DOM-Node
     * @param {String|Number} keyframes.<from-to|0-999|0%-100%> The scroll-offset where the css rules apply to
     * @param {String} keyframes.<css-property> The valid css properties which to transform
     *
     * @api public
     */
    Transe.prototype.addFrame = function (keyframes) {

        for (var key in keyframes) {
            this._parseFrame(key, keyframes[key], new Date().getTime());
        }

        return this;
    };




    /**
     * Recalculate the keyframes-object
     *
     * @api public
     */
    Transe.prototype.refresh = function () {
        this.innerSize = get.innerSize[this.options.axis](this.options.outer);
        this.outerSize = get.outerSize[this.options.axis](this.options.outer);

        // Make sure the document is high enough that all key frames fit inside
        this._forceSize();

        for (var id in this.map) {
            this._parseFrame(this.map[id].elem, this.map[id].temp, id);
        }

    };



    /**
     * Removes a frame by its ID
     *
     * @param {String|Number} id
     * @api public
     */
    Transe.prototype.removeById = function (id) {
        delete this.map[id];
    };



    /**
     * Removes a frame by its Node
     *
     * @param {Node} elem
     * @api public
     */
    Transe.prototype.removeByNode = function (elem) {
        for (var id in this.map) {
            if (elem === this.map[id].elem) delete this.map[id];
        }
    };



    /**
     * Removes a frame by its scroll-offset
     *
     * @param {String|Number} offset
     * @api public
     */
    Transe.prototype.removeByFrame = function (offset) {
        for (var id in this.map) {
            var keyframes = this.map[id].temp;
            for (var pos in keyframes) {
                if (offset == pos) delete this.map[id];
            }
        }
    };



    /**
     * Add a parser-method to our instances
     *
     * @param {String} name
     * @param {Function} parser
     */
    Transe.prototype.addParser = function (name, parser) {
        PARSER[name] = parser;
    };



    /**
     * Add the scroll behaviours for color, transforms and such
     */
    PARSER = {
        tmpl: function (prop, start, end, pos) {
            return;
            var rxInterpolateString = /{(\d+)}/;
            var str = 'url(foo/bar/{12}.jpg)';
            var match = rxInterpolateString.exec(str);

            str = str.replace(match[0], function(a, b, c) {
                return b;
            });
        },
        color: function (prop, start, end, pos) {
            if (!prop.match(/color/i)) return;

            start = parseColor(start);
            end = parseColor(end);
            var rgb = [
                val(start[0], end[0], pos) | 0,
                val(start[1], end[1], pos) | 0,
                val(start[2], end[2], pos) | 0
            ];

            if (hasRGBA) {
                rgb[3] = parseFloat(val(start[3], end[3], pos));
                return 'rgba(' + rgb.join() + ')';
            }

            return 'rgb(' + rgb.join() + ')';
        },


        units: function (prop, start, end, pos) {
            if (prop.match(/color|transform|clip/i)) return;

            var startVals = (start + '').split(' ');
            var endVals = (end + '').split(' ');
            var newStyle = '';

            for (var i = 0, len = startVals.length; i < len; i++) {

                // boxShadow/textShadow
                if (parseColor(startVals[i]) || parseColor(endVals[i])) {
                    newStyle += this.color('color', startVals[i], endVals[i], pos) + ' ';
                    continue;
                }

                var startVal = parseFloat(startVals[i]);
                var startUnit = Helpers.getUnit(startVals[i])[1] || '';

                var endVal = parseFloat(endVals[i]);
                var endUnit = Helpers.getUnit(endVals[i])[1] || startUnit || '';
                if (len > 1) endUnit += ' ';

                newStyle += val(startVal, endVal, pos) + endUnit;
            }

            return newStyle;
        },

        transform: function (prop, start, end, pos) {
            if (!prop.match(/transform|clip/)) return;

            var startProps = start.split(' ');
            var endProps = end.split(' ');
            var newStyle = '';

            if (startProps.length !== endProps.length)
                throw "The number of start values and end values does not match";

            for (var i = 0; i < startProps.length; i++) {
                var ident = Helpers.getIdent(startProps[i]);
                newStyle += ident + '(';

                var startVals = Helpers.matrixToArray(startProps[i]);
                var endVals = Helpers.matrixToArray(endProps[i]);

                for (var p = 0; p < startVals.length; p++) {
                    var startVal = parseFloat(startVals[p]);
                    var startUnit = Helpers.getUnit(startVals[p])[1] || '';

                    var endVal = parseFloat(endVals[p]);
                    var endUnit = Helpers.getUnit(endVals[p])[1] || startUnit || '';

                    newStyle += val(startVal, endVal, pos) + endUnit + ' ';
                }
                newStyle += ') ';
            }

            return newStyle;

        }
    };



    /**
     * Make sure the document is high enough
     * that all key frames can fit inside
     * @api private
     */
    Transe.prototype._forceSize = function() {

        // stop here, if the max-height is already big enough
        // or if is falsy per defaults
        if ( !this.options.forcesize || this._maxFrame === this.outerSize - this.innerSize ) return;

        // get the highest scroll-offset in frames,
        // in this case the last one
        var maxFrame = this.keys[this.keys.length-1] | 0;

        // override _maxFrame if it is lower than before
        if (!this._maxFrame || maxFrame > this._maxFrame) this._maxFrame = maxFrame;

        this.outerSize = this._maxFrame + this.innerSize;

        this.inner.style[{y: 'height', x: 'width'}[this.options.axis]] = this.outerSize + 'px';
    };



    /**
     * Get/set the current scroll offset
     *
     * @param {Number|String} [offset] A setter if we need to set the scroll offset manually
     * @api private
     */
    Transe.prototype._getScroll = function (offset) {
        return (offset || get[this.options.offsetter][this.options.axis](this.options.inner)) | 0;
    };



    /**
     * Gets the inner/outer height
     * if they aren't real DOM-Nodes
     * use window/document dimensions
     *
     * @param {String} method
     */
    Transe.prototype._setSize = function () {
        this.innerSize = get.innerSize[this.options.axis](this.options.outer);
        this.outerSize = get.outerSize[this.options.axis](this.options.outer);
    };



    /**
     * Adds the elements and their properties to the keyframes-object
     * iterates over the total (wrapper) `outerSize`
     *
     * @param {Node|String} elem
     * @param {Object} keyframes
     * @param {Number} id
     */
    Transe.prototype._parseFrame = function (elem, keyframes, id) {
        elem = typeof elem === 'string' ? document.querySelectorAll(elem) : elem;

        var keys = Object.keys(keyframes);
        var len = keys.length;
        var i;

        // if there is just one keyframe or less, stop here
        if (len < 2) return;


        // we save/clone the keyframes to make it possible
        // to reuse them later as originals 
        var temp = clone(keyframes);


        // if `from` and `to` are present
        if (len === 2 && keyframes.from && keyframes.to) {
            keyframes[0] = keyframes.from;
            delete keyframes.from;

            keyframes[this.outerSize - this.innerSize] = keyframes.to;
            delete keyframes.to;
        }


        // make it possible to use percentage in keyframes
        for (i = 0; i < len; i++) {

            var key = keys[i];

            // we check for a `%` in each frame-value and skip if is not
            if (key.indexOf('%') === -1) continue;

            // and convert the percentage-value to its range
            var range = Helpers.percentToRange(parseFloat(key), 0, this.outerSize - this.innerSize);

            // then we add it to the keyframes-object and remove the old key
            keyframes[range | 0] = keyframes[key];
            delete keyframes[key];
        }


        // store the keyframe offsets again,
        // needed since the keyframes-object has changed just now
        keys = this.keys = Object.keys(keyframes);


        // Make sure the document is high enough that all key frames fit inside
        // but only on instantiation since we force the height in `refresh` again
        if (!this.map[id]) this._forceSize();


        // we populate all missing css-properties to the keyframes-object
        keyframes = populate(elem, keyframes);

        this.map[id] = {
            elem: elem,
            keyframes: keyframes,
            temp: temp,
            frames: []
        };


        for (i = 0, index = 0; i < this.outerSize; i++) {
            // if the position has exceeded the current scope,
            // jump to next keyframes
            if (index + 1 < len && i > keys[index + 1]) index++;
            this._parseCSS(keyframes, i, index, id);
        }

        // initialize the scrolling and add the resize event
        this._init();
    };



    /**
     * Prepare the keyframes-object to use later in scroll-method
     *
     * @param {Object} keyframes
     * @param {Number} pos
     * @param {Number} index
     * @param {Number} id
     */
    Transe.prototype._parseCSS = function (keyframes, pos, index, id) {

        // get keyframe offsets
        var keys = this.keys;

        // get previous keyframe
        var prev = {};
        prev.pos = keys[index];
        prev.css = keyframes[prev.pos];

        // if not reached yet, return
        if (pos < prev.pos) return this.map[id].frames[pos] = prev.css;


        // get next keyframe
        var next = {};
        next.pos = keys[index + 1];
        next.css = keyframes[next.pos];

        // if already reached, return
        if (!next.css) return this.map[id].frames[pos] = prev.css;


        // get the easing method from defaults
        var easing = ($ && $.easing[this.options.easing]) || this.options.easing;

        // loop through all css properties being animated
        var perc = (pos - prev.pos) / (next.pos - prev.pos);
        var cssKeys = Object.keys(prev.css);
        var len = cssKeys.length;

        this.map[id].frames[pos] = {};

        for (var i = 0; i < len; i++) {
            var prop = cssKeys[i];
            var start = prev.css[prop];
            var end = next.css[prop];

            // http://www.gizma.com/easing/
            var ease = easing(perc, perc * 1000, 0, 1, 1000);

            for (var par in PARSER) {
                var parser = PARSER[par](prop, start, end, ease);

                // if return value of our parser is an object,
                // use its properties as getter/setter
                if (typeof parser === 'object') {
                    for (var key in parser) {
                        this.map[id].frames[pos][key] = parser[key];
                    }
                    continue;

                // otherwise use its return value as setter
                } else if (parser) {
                    ease = parser;
                }
            }

            // if is !NaN
            // http://jsperf.com/isnanfunc-vs-isnan/4#title-8
            if (ease === ease) this.map[id].frames[pos][prop] = ease;
        }
    };




    // Expose Transe to the global object
    window.Transe = Transe;


    // If jQuery is not present, stop here
    if (!$) return;
    $.transe = $.fn.transe = function (keyframes, options) {
        var transe = new Transe(options);
        $.transe.refresh = $.proxy(transe, 'refresh');

        // $('node').transe();
        if (this instanceof $) {
            return this.each(function () {
                transe._parseFrame($(this), keyframes, new Date().getTime());
            });
        }

        // $.transe();
        for (var key in keyframes) {
            transe._parseFrame($(key), keyframes[key], new Date().getTime());
        }

        return transe;
    };

    // make some methods available outside this wrapper
    $.transe.helpers = Helpers;
    $.transe.addParser = Transe.prototype.addParser;

}(this.jQuery, this, document));


// Object.keys polyfill for IE8 and below
Object.keys = Object.keys || function(o, k){
    var r = [];
    for(k in o) r.hasOwnProperty.call(o, k) && r.push(k);
    return r;
};