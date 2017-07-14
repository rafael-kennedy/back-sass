# Back-SASS

> Warning: This is (very) experimental, and not intended for production. More 
importantly, NEVER use this package to process untrusted code.

This allows you to embed javascript into scss (currently indented syntax is not supported) between back-ticks. Any javascript between backticks will be evaluated, and its output concatenated into the sass. If the output is a string, it will be concatenated. If it produces no output, nothing will be added to the sass, and if it is an object, it will be formatted as sass before being added to the sass. This allows you to use all of the benefits of sass without relying on the limited sass-script syntax and ecosystem.

imports in the form `@import 'file/path.bscss'` will work as expected.

## Installation:

Install with npm:

```bash
npm i -D back-sass
```

## Usage

```javascript
const backSass = require('back-sass')

backSass.fromString(someString) // outputs css
backSass.fromFile(someFilePath) // outputs css
```

There are two types of interpolation. If your javascript does not contain any backticks (even in comments) you can simply place your javascript between backticks:

```
.main {
  border-radius: `getBorderRadius(someParam)`
}
```

If you want to make use of ES2015 template literals (and why wouldn't you?) you can use the format as follows:

```
.main {
  border-radius: `* `${getBorderRadius(someParam)}px` *`
}
```

multiline code should work as intended.

files imported with a .bscss extension will be interpereted as back-sass and handled correctly.

There is not yet any support for async code within backsass interpolations.
