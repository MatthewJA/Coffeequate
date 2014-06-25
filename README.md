Coffeequate <sub>v0.3.1</sub>
=============================

A computer algebra system for JavaScript. More information at [the webpage](http://matthewja.com/Coffeequate).

## Installation
Include Coffeequate with an AMD loader, or load it into a `<script>` tag.

```javascript
require.config({
    paths: {
      "coffeequate": "coffeequate.min"
    }
});
```

```html
<script src="coffeequate.min.js"></script>
```

## Use
Coffeequate gives you a `CQ` function which wraps the functionality of Coffeequate. An alias of this function is `coffeequate`.

To make a new expression, just call `CQ`:
```javascript
expr = CQ("m * c**2");
```

You can also make an expression with equation syntax, as follows:
```javascript
expr = CQ("E = m * c**2");
```

All expressions will be equated to zero.

The formatting of these strings must be as follows: You can use `*` for multiplication, `**` for exponentiation, `+` for addition, `-` for *negation* (not subtraction), `1/2` for a fractional constant, and `()` parentheses to change the order of operations. Negation and parenthesising are higher precedence than exponentiation, which is higher precedence than multiplication, which is higher precedence than addition.

## License
All current and previous versions licensed under the MIT License. See /LICENSE for a copy of this license.
