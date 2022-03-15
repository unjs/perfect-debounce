export interface DebounceOptions {
  /**
  Call the `fn` on the [leading edge of the timeout](https://css-tricks.com/debouncing-throttling-explained-examples/#article-header-id-1).
  Meaning immediately, instead of waiting for `wait` milliseconds.
  @default false
  */
  readonly before?: boolean;

  /**
   * Execute `function_` unless a previous call is still pending, in which case, return the pending promise. Useful, for example, to avoid processing extra button clicks if the previous one is not complete.
   */
  readonly waitForPromise?: boolean;
}

const DEBOUNCE_DEFAULTS: DebounceOptions = {
  waitForPromise: true
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
  // Validate options
  options = { ...DEBOUNCE_DEFAULTS, ...options }
  if (!Number.isFinite(wait)) {
    throw new TypeError('Expected `wait` to be a finite number')
  }

  // Only used with options.before enabled
  let leadingValue: PromiseLike<ReturnType> | ReturnType

  // Debounce timeout handle
  let timeout: NodeJS.Timeout

  // Promises to be resolved when debounce if finished
  let resolveList: Array<(unknown) => void> = []

  let currentPromise: Promise<ReturnType>

  const applyFn = async (_this, args) => {
    currentPromise = _applyPromised(fn, _this, args)
    if (options.waitForPromise) {
      currentPromise.finally(() => { currentPromise = null })
    }
    return currentPromise
  }

  return function (...args) {
    if (options.waitForPromise && currentPromise) {
      return currentPromise
    }

    return new Promise((resolve) => {
      const shouldCallNow = options.before && !timeout

      clearTimeout(timeout)

      timeout = setTimeout(() => {
        timeout = null

        const result = options.before ? leadingValue : applyFn(this, args)
        for (const _resolve of resolveList) {
          _resolve(result)
        }

        resolveList = []
      }, wait)

      if (shouldCallNow) {
        leadingValue = applyFn(this, args)
        resolve(leadingValue)
      } else {
        resolveList.push(resolve)
      }
    })
  }
}

async function _applyPromised (fn: Function, _this: unknown, args: any[]) {
  return await fn.apply(_this, args)
}
