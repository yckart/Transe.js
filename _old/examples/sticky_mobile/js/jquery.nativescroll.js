$.extend($.easing,{easeOutExpo:function(e,a,b,c,d){return a===d?b+c:c*(-Math.pow(2,-10*a/d)+1)+b;}});

/*!
* jquery.nativescroll.js 0.1 - https://github.com/yckart/nativescroll
* Get scrollTop offset on touchdevices and more!
*
* Copyright (c) 2012 Yannick Albert (http://yckart.com)
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
* 2012/11/11
*/
;(function($, window, document, undefined) {
    $.nativeScroll = $.fn.nativeScroll = function(options) {
        options = $.extend({}, $.fn.nativeScroll.options, options);

        if (!(this instanceof $)) {
            return $.fn.nativeScroll.apply($.browser.webkit ? $('body') : $('html'), arguments);
        }

        return this.each(function() {
            var elem = $(this),
                win = $(window),
                isTouch = "ontouchend" in window,
                startY, dy, event, move,
                lastPos = {
                    x: 0,
                    y: 0
                },
                lastCheck = 0,
                lastSpeed = 0,

                onTouchStart = function(e) {
                    event = isTouch ? e.originalEvent.touches[0] || e.originalEvent.changedTouches[0] : e;
                    startY = event.pageY;
                    $(this).data('down', true).data('y', event.clientY).data('scrollTop', this.scrollTop);
                    move = false;
                },

                onTouchMove = function(e) {
                    event = isTouch ? e.originalEvent.touches[0] || e.originalEvent.changedTouches[0] : e;
                    dy = event.pageY - startY;

                    if ($(this).data('down')) {
                        $(this).stop(false, true).animate({
                            scrollTop: $(this).data('scrollTop') + ($(this).data('y') - event.clientY)
                        });
                    }
                    move = true;

                    // get touch speed, used in "touchend"
                    var curCheck = +new Date().getTime();
                    if (lastCheck <= curCheck) {
                        lastCheck = curCheck;
                        var time = curCheck - lastCheck;

                        if (time <= 0) {time = 1;}

                        var curPos = {
                            x: event.pageX,
                            y: event.pageY
                        },
                            a = curPos.x - lastPos.x,
                            b = curPos.y - lastPos.y,
                            curDistance = Math.sqrt(a * a + b * b),
                            curSpeed = Math.ceil(curDistance / time);

                        lastSpeed = curSpeed;
                        lastPos = curPos;
                    }

                    e.preventDefault();
                },

                onTouchEnd = function() {
                    $(this).data('down', false);
                    if(move && lastSpeed > 3){
                        $(this).stop().animate({
                            scrollTop: "-=" + dy * options.delay
                        }, options.speed, options.easing);
                    }
                };

            elem.on(!options.desktop || isTouch ? "touchstart" : "mousedown", onTouchStart);
            elem.on(!options.desktop || isTouch ? "touchmove" : "mousemove", onTouchMove);
            elem.on(!options.desktop || isTouch ? "touchend" : "mouseup", onTouchEnd);

            // generate scrollbar
            if (options.scrollbar) {
                var scrollTimer = null,
                    isBody = /^(html|body)$/i.test(elem[0].nodeName);
                elem.append("<div class='scrollbar'></div>");

                $(isBody ? window : elem[0]).on("scroll", function(event) {
                    var max = $.makeArray($(this)).sort(function(a, b) {
                        return (parseInt($(b).css("height"), 10) || 1) - (parseInt($(a).css("height"), 10) || 1);
                    }).shift(),
                        winH = $(this).height(),
                        docH = isBody ? $(document).height() : $(this).children(max).height(),
                        scrollbarHeight = winH / docH * winH,
                        progress = $(this).scrollTop() / (docH - winH),
                        distance = progress * (winH - scrollbarHeight) + scrollbarHeight / 2 - $("." + options.scrollbarClass).height() / 2;

                    $("." + options.scrollbarClass).css({
                        top: distance,
                        height: scrollbarHeight
                    }).fadeIn(100);

                    if (scrollTimer !== null) {
                        clearTimeout(scrollTimer);
                    }
                    scrollTimer = setTimeout(function() {
                        $("." + options.scrollbarClass).fadeOut();
                    }, 1000);
                });
            }
        });
    };

    $.fn.nativeScroll.options = {
        delay: 2,
        speed: 600,
        easing: "easeOutExpo",
        desktop: true,
        scrollbar: "ontouchend" in document,
        scrollbarClass: "scrollbar"
    };

})(jQuery, window, document);