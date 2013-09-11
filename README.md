#No documentation yet!

##Usage

    <div class="box first"></div>
    <div class="box"></div>

###Vanilla

    var transe = new Transe();

    transe.addFrame({
        // from - to
        'body': {
            from: {
                backgroundColor: 'rgb(0, 10, 100)'
            },
            to: {
                backgroundColor: 'rgb(0, 100, 100)'
            }
        },

        // percentage
        '.box': {
            '0%': {
                right: '100%',
                transform: 'rotate(0)'
            },
            '100%': {
                right: 0,
                transform: 'rotate(360deg)'
            }
        },

        // fixed
        '.first': {
            0: {
                background: '#f00'
            },

            400: {
                background: '#000'
            }
        }
    });


###jQuery

    $.transe({
        // from - to
        'body': {
            from: {
                backgroundColor: 'rgb(0, 10, 100)'
            },
            to: {
                backgroundColor: 'rgb(0, 100, 100)'
            }
        },

        // percentage
        '.box': {
            '0%': {
                right: '100%',
                transform: 'rotate(0)'
            },
            '100%': {
                right: 0,
                transform: 'rotate(360deg)'
            }
        },

        // fixed
        '.first': {
            0: {
                background: '#f00'
            },

            400: {
                background: '#000'
            }
        }
    });

Take a look at the [examples](https://github.com/yckart/Transe.js/tree/master/examples).

#Support

[@yckart](http://twitter.com/yckart/) #transe


##Thanks
- http://lea.verou.me/2009/02/find-the-vendor-prefix-of-the-current-browser/ # *Link in comments*
- http://css3.bradshawenterprises.com/transitions/ # *CSS3 Transitions*
- http://forum.jquery.com/topic/automatic-color-change-during-scrolling # *color transform*
- http://www.kylearch.com/web-development/jquery-background-color-scroll # *color transform* (inspiration)


###License
Copyright (c) 2013 Yannick Albert ([http://yckart.com/](http://yckart.com/))

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.