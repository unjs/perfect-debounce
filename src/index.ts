export interface DebounceOptions {
  /**
  Call the `fn` on the [leading edge of the timeout](https://css-tricks.com/debouncing-throttling-explained-examples/#article-header-id-1).
  Meaning immediately, instead of waiting for `wait` milliseconds.
  @default false
  */
  readonly before?: boolean;
}

/**
[Debounce](https://css-tricks.com/debouncing-throttling-explained-examples/) promise-returning & async functions.
@param fn - Promise-returning/async function to debounce.
@param wait - Milliseconds to wait before calling `fn`.
@returns A function that delays calling `fn` until after `wait` milliseconds have elapsed since the last time it was called.
@example
```
import pDebounce from 'p-debounce';
const expensiveCall = async input => input;
const debouncedFn = pDebounce(expensiveCall, 200);
for (const number of [1, 2, 3]) {
  console.log(await debouncedFn(number));
}
//=> 3
//=> 3
//=> 3
```
*/
export function debounce <ArgumentsType extends unknown[], ReturnType> (
  fn: (...args: ArgumentsType) => PromiseLike<ReturnType> | ReturnType,
  wait: number,
  options: DebounceOptions = {}
) {
  if (!Number.isFinite(wait)) {
    throw new TypeError('Expected `wait` to be a finite number')
  }

  let leadingValue
  let timeout
  let resolveList = []

  return function (...arguments_) {
    return new Promise((resolve) => {
      const shouldCallNow = options.before && !timeout

      clearTimeout(timeout)

      timeout = setTimeout(() => {
        timeout = null

        const result = options.before ? leadingValue : fn.apply(this, arguments_)

        for (resolve of resolveList) {
          resolve(result)
        }

        resolveList = []
      }, wait)

      if (shouldCallNow) {
        leadingValue = fn.apply(this, arguments_)
        resolve(leadingValue)
      } else {
        resolveList.push(resolve)
      }
    })
  }
}

/**
Execute `function_` unless a previous call is still pending, in which case, return the pending promise. Useful, for example, to avoid processing extra button clicks if the previous one is not complete.
@param function_ - Promise-returning/async function to debounce.
@example
```
import {setTimeout as delay} from 'timers/promises';
import pDebounce from 'p-debounce';
const expensiveCall = async value => {
  await delay(200);
  return value;
}
const debouncedFn = pDebounce.promise(expensiveCall);
for (const number of [1, 2, 3]) {
  console.log(await debouncedFn(number));
}
//=> 1
//=> 2
//=> 3
```
*/
export function debouncePromise<ArgumentsType extends unknown[], ReturnType> (
  function_: (...args: ArgumentsType) => PromiseLike<ReturnType> | ReturnType
): (...args: ArgumentsType) => Promise<ReturnType> {
  let currentPromise

  return async function (...arguments_) {
    if (currentPromise) {
      return currentPromise
    }

    try {
      currentPromise = function_.apply(this, arguments_)
      return await currentPromise
    } finally {
      currentPromise = undefined
    }
  }
}
