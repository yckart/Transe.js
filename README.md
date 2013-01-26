#Usage ([wiki](https://github.com/yckart/jquery.transe.js/wiki))
It's quite simple!

Standard Prozedure: include the `jQuery`-lib and `jQuery.transe.js`:
```html
<script src="jquery.js"></script>
<script src="jquery.transe.js"></script>

<!--
You can optional include the TweenMax library
(or TweenLite with its CSS-Plugin)
<script src="TweenMax.js"></script>
-->
```

Initialize [Transe](http://github.com/yckart/jquery.transe.js) on the element you wish to transform. You must at least set `from`-offset, `to`-offset, `css`-property, `start`-value and `end`-value.
```javascript
$('.elem').transe({
    from: 0,
    to: 1000,
    css: 'transform',
    start: 'rotate(0deg)',
    end: 'rotate(180deg)'
});
```

If you've a lot elements to Transe, it's even possible (and recommended) to wrap an array around your objects:

```javascript
$.transe([
    document.body, {
        from: 0,
        to: 500,
        css: 'backgroundColor',
        start: 'rgb(255, 255, 255)',
        end: 'rgb(0, 0, 0)'
    },
    '.elem', {
        from: 0,
        to: 500,
        css: 'left',
        start: 0,
        end: 100
    }
]);
```

#Examples
Take a look at [https://github.com/yckart/jQuery.transe.js/tree/master/examples](https://github.com/yckart/jQuery.transe.js/tree/master/examples).


#Options
There're lot of options you can set.

* <b>`container`</b> The container where you're scrolling in. (default: `window`)
    * Possibles
        * Each element which is in your `DOM`

* <b>`direction`</b> Which direction you're scrolling. (default: `'y'`)
    * Possibles
        * `y` // vertical
        * `x` // horizontal

* <b>`from`</b> The position where the transformation starts (default `0`)
    * Possibles
        * All numbers between 0 and Infinity

* <b>`to`</b> The position where the transformation ends (default `0`)
    * Possibles
        * All numbers between 0 and Infinity

* <b>`css`</b> The property to transform (default: `''`)
    * Possibles
        * You can actually use ANY `css2` / `css3`-property that expects a number as value. Here's an [overview](https://github.com/yckart/jQuery.transe.js/wiki/Properties)

* <b>`tween`</b> You like smooth animations? Me too! You can use the TweenLite library and their possibilities.
    * `use` Enables the power of TweenLite (default: `false`)
    * `speed` The animation duration duration (default: `1`)
    * `easing` The easing method for your animations (default: `''`)

* <b>`easing`</b> The easing method applies for your total scroll transform (default: `'linear'`)
    * Possibles
        * `'linear'`
        * `'swing'`
        * ...and all methods you write or make possible via the [easing plugin](http://gsgd.co.uk/sandbox/jquery/easing/).

* <b>`scrollProperty`</b> The property which is used to do your transformation (default: `scroll`)
    * Possibles
        * `'scroll'`
        * `'position'`
        * `'margin'`
        * `'transform'`

* <b>`isHidden`</b> Fire's a callback if the element is hidden
* <b>`isVisible`</b> Fire's a callback if the element is visible

#Public Methods
* `option` Get and set options after instantiation
    * Get: `$('.elem').transe('option')` returns all options that have been applied to the element.
    * Get: `$('.elem').transe('option', 'css')` returns the applied css-property
    * Set: `$('.elem').transe('option', 'scrollProperty', 'transform')` sets the `scrollProperty` to `transform`
* `destroy` Removes the Transe instance, returning target element to it's initial state

#Todo
**Add**
* Color support for `rgba` and `hex`
* Make it possible to use units (`px`, `%`, `em` etc.)
* Create a workaround to make 4-digit margin/padding strings possible

**Fix**
* Fix the destroy method (doesn't work with multiple instances)

#Browser Support
[Transe](http://github.com/yckart/jquery.transe.js) works with all browsers that supports thes CSS-Property you use. If you've the need to support CSS3-features like `transform`s you can you libraries like:
* [jquery.transition.js](https://github.com/louisremi/jquery.transition.js) by Louis-Rémi
* [transform](https://github.com/heygrady/transform) by Grady Kuhnline
* [transformie](https://github.com/pbakaus/transformie) by Paul Bakaus

#Credits

[@yckart](http://twitter.com/yckart/) #transe


##Thanks
- http://lea.verou.me/2009/02/find-the-vendor-prefix-of-the-current-browser/ # *Link in comments*
- http://css3.bradshawenterprises.com/transitions/ # *CSS3 Transitions*
- http://forum.jquery.com/topic/automatic-color-change-during-scrolling # *color transform*
- http://www.kylearch.com/web-development/jquery-background-color-scroll # *color transform* (inspiration)


###License
Copyright (c) 2012 Yannick Albert ([http://yckart.com/](http://yckart.com/))

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
