/*!
* jquery.scrolltransform.js 0.1 - https://yckart.com/code/scrollTransform
* Transformable scroll elements!
*
* Inspired by John Polacek's Scrollorama
*
* Copyright (c) 2012 Yannick Albert (http://yckart.com)
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
* 2012/11/21
*/
;(function($, window, undefined) {
    "use strict";
    $.fn.scrollTransform = function(options) {

        options = $.extend({}, $.fn.scrollTransform.options, options);

        return this.each(function() {
            var elem = $(this),

                scrollRange = options.end - options.start,

                // create objects before and after literal
                cssArgsBefore = {},
                cssArgsAfter = {};

            // assign the variable property for before and after
            cssArgsBefore[options.property] = options.before;
            cssArgsAfter[options.property] = options.after;

            // setup fromElement
            if (options.fromElement) {

                var startingElement = $(options.fromElement),
                    startingElementOffset = startingElement.offset(),
                    startingElementOffsetTop = startingElementOffset.top,
                    startingElementOffsetLeft = startingElementOffset.left,

                    windowWidth = options.window.width(),
                    windowHeight = options.window.height(),

                    scrollFromTop = startingElementOffsetTop - windowHeight,
                    scrollFromLeft = startingElementOffsetLeft - windowWidth;

                $(window).bind('resize', function() {

                    windowWidth = options.window.width();
                    windowHeight = options.window.height();

                    scrollFromTop = startingElementOffsetTop - windowHeight;
                    scrollFromLeft = startingElementOffsetLeft - windowWidth;

                });

            }

            // setup css3 transform
            if (options.property === 'transform') {

                var before = options.before.split('('),
                    after = options.after.split('(');

                // set css3 transform webkit and moz fallbacks
                cssArgsBefore['filter'] = options.before;
                cssArgsAfter['filter'] = options.after;
                cssArgsBefore['-webkit-transform'] = options.before;
                cssArgsAfter['-webkit-transform'] = options.after;
                cssArgsBefore['-moz-transform'] = options.before;
                cssArgsAfter['-moz-transform'] = options.after;
                cssArgsBefore['-o-transform'] = options.before;
                cssArgsAfter['-o-transform'] = options.after;

                // get int from css3 transform rotate and skew
                if (options.before.indexOf('deg') !== -1) {

                    before = before[1].split('deg');
                    before = parseFloat(before[0]);

                    after = after[1].split('deg');
                    after = parseFloat(after[0]);

                }
                 // get int from css3 transform scale
                else if (options.before.indexOf('scale') !== -1) {

                    before = before[1].split(')');
                    before = parseFloat(before[0]);

                    after = after[1].split(')');
                    after = parseFloat(after[0]);

                }

            }


            function transformIt() {
                var scroll,
                    currentCss = {};

                if (options.direction === 'vertical') {
                    scroll = options.window.scrollTop();
                    if (options.fromElement) {
                        scroll = scroll - scrollFromTop;
                    }
                } else if (options.direction === 'horizontal') {
                    scroll = options.window.scrollLeft();
                    if (options.fromElement) {
                        scroll = scroll - scrollFromLeft;
                    }
                }

                var scrollPercentage = (scroll - options.start) / scrollRange;

                // fire the callback
                if(scroll < options.end && scroll > options.start){
                    options.callback(elem);
                }

                if (scroll < options.start) {
                    elem.css(cssArgsBefore);
                } else if (scroll > options.end) {
                    elem.css(cssArgsAfter);
                } else {
                    var currentTransform;
                    if (options.property === 'transform') {

                        var currentTransformValue = before + (after - before) * scrollPercentage;
                        if (options.before.indexOf('rotate') !== -1) {

                            if($.browser.msie && Number($.browser.version) <= 8) {

                                var costheta = Math.cos(currentTransformValue*(Math.PI * 2 / 360)),
                                    sintheta = Math.sin(currentTransformValue*(Math.PI * 2 / 360)),

                                    a = parseFloat(costheta).toFixed(8),
                                    b = parseFloat(-sintheta).toFixed(8),
                                    c = parseFloat(sintheta).toFixed(8),
                                    d = parseFloat(costheta).toFixed(8);

                                //currentTransform = 'progid:DXImageTransform.Microsoft.BasicImage(rotation='+Number(currentTransformValue/100)+')';
                                currentTransform = "progid:DXImageTransform.Microsoft.Matrix(M11="+a+", M12="+b+", M21="+c+", M22="+d+", SizingMethod='auto expand')";

                            } else {
                                currentTransform = 'rotate(' + currentTransformValue + 'deg)';
                            }

                        } else if (options.before.indexOf('skew') !== -1) {
                            currentTransform = 'skew(' + currentTransformValue + 'deg)';
                        } else if (options.before.indexOf('scale') !== -1) {

                            if ($.browser.msie && Number($.browser.version) <= 8) {
                                currentTransform = "progid:DXImageTransform.Microsoft.Matrix(M11="+currentTransformValue+", M12=0, M21=0, M22="+currentTransformValue+", SizingMethod='auto expand')";
                            } else {
                                currentTransform = 'scale(' + currentTransformValue + ')';
                            }

                        }

                        currentCss[options.property] = currentTransform;
                        currentCss['filter'] = currentTransform;
                        currentCss['-o-transform'] = currentTransform;
                        currentCss['-moz-transform'] = currentTransform;
                        currentCss['-webkit-transform'] = currentTransform;

                        elem.css(currentCss);

                    } else {
                        currentCss[options.property] = options.before + (options.after - options.before) * scrollPercentage;
                        elem.css(currentCss);
                    }

                }

            }

            transformIt();
            options.window.bind('scroll', transformIt);

        });
    };

    $.fn.scrollTransform.options = {
        window: $(window),
        fromElement: false,
        direction: 'vertical',
        start: 0,
        end: 0,
        property: '',
        before: 0,
        after: 0,
        callback: function(elem){}
    };

})(jQuery, window);