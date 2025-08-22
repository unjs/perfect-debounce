# perfect-debounce

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]

Improved debounce function with Promise support.

## Features

- Well tested debounce implementation
- Native Promise support
- Avoid duplicate calls while promise is being resolved
- Configurable `trailing` and `leading` behavior

## Usage

Install package:

```sh
# npm
npm install perfect-debounce

# yarn
yarn add perfect-debounce

# pnpm
pnpm add perfect-debounce
```

Import:

```js
// ESM
import { debounce } from "perfect-debounce";

// CommonJS
const { debounce } = require("perfect-debounce");
```

Debounce function:

```js
const debounced = debounce(async () => {
  // Some heavy stuff
}, 25);

// Control methods:
debounced.cancel(); // Cancel any pending call
await debounced.flush(); // Immediately invoke pending call (if any)
debounced.isPending(); // Returns true if a call is pending
```

When calling `debounced`, it will wait at least for `25ms` as configured before actually calling your function. This helps to avoid multiple calls.

### Control Methods

The returned debounced function provides additional control methods:

- `debounced.cancel()`: Cancel any pending invocation that has not yet occurred.
- `await debounced.flush()`: Immediately invoke the pending function call (if any) and return its result.
- `debounced.isPending()`: Returns `true` if there is a pending invocation waiting to be called, otherwise `false`.

#### Example usage

```js
const debounced = debounce(async (value) => {
  // Some async work
  return value * 2;
}, 100);

debounced(1);
debounced(2);
debounced(3);

// Check if a call is pending
console.log(debounced.isPending()); // true

// Immediately invoke the pending call
const result = await debounced.flush();
console.log(result); // 6

// Cancel any further pending calls
debounced.cancel();
```

To avoid initial wait, we can set `leading: true` option. It will cause function to be immediately called if there is no other call:

```js
const debounced = debounce(
  async () => {
    // Some heavy stuff
  },
  25,
  { leading: true },
);
```

If executing async function takes longer than debounce value, duplicate calls will be still prevented a last call will happen. To disable this behavior, we can set `trailing: false` option:

```js
const debounced = debounce(
  async () => {
    // Some heavy stuff
  },
  25,
  { trailing: false },
);
```

## 💻 Development

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

## License

Made with 💛

Based on [sindresorhus/p-debounce](https://github.com/sindresorhus/p-debounce).

Published under [MIT License](./LICENSE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/perfect-debounce?style=flat-square
[npm-version-href]: https://npmjs.com/package/perfect-debounce
[npm-downloads-src]: https://img.shields.io/npm/dm/perfect-debounce?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/perfect-debounce
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/unjs/perfect-debounce/ci.yml?branch=main&style=flat-square
[github-actions-href]: https://github.com/unjs/perfect-debounce/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/gh/unjs/perfect-debounce/main?style=flat-square
[codecov-href]: https://codecov.io/gh/unjs/perfect-debounce
