export interface DebounceOptions {
  /**
  Call the `fn` on the [leading edge of the timeout](https://css-tricks.com/debouncing-throttling-explained-examples/#article-header-id-1).
  Meaning immediately, instead of waiting for `wait` milliseconds.
  @default false
  */
  readonly leading?: boolean;

  /**
  Call the `fn` on trailing edge with last used arguments. Result of call is from previous call.
  @default true
  */
  readonly trailing?: boolean;
}

const DEBOUNCE_DEFAULTS: DebounceOptions = {
  trailing: true,
};

/**
Debounce functions
@param fn - Promise-returning/async function to debounce.
@param wait - Milliseconds to wait before calling `fn`. Default value is 25ms
@returns A function that delays calling `fn` until after `wait` milliseconds have elapsed since the last time it was called.
@example
```
import { debounce } from 'perfect-debounce';
const expensiveCall = async input => input;
const debouncedFn = debounce(expensiveCall, 200);
for (const number of [1, 2, 3]) {
  console.log(await debouncedFn(number));
}
//=> 3
//=> 3
//=> 3
```
*/
export function debounce<ArgumentsT extends unknown[], ReturnT>(
  fn: (...args: ArgumentsT) => PromiseLike<ReturnT> | ReturnT,
  wait = 25,
  options: DebounceOptions = {}
) {
  // Validate options
  options = { ...DEBOUNCE_DEFAULTS, ...options };
  if (!Number.isFinite(wait)) {
    throw new TypeError("Expected `wait` to be a finite number");
  }

  // Last result for leading value
  let leadingValue: PromiseLike<ReturnT> | ReturnT;

  // Debounce timeout handle
  let timeout: NodeJS.Timeout;

  // Promises to be resolved when debounce if finished
  let resolveList: Array<(val: unknown) => void> = [];

  // Keep state of currently resolving promise
  let currentPromise: Promise<ReturnT>;

  // Trailing call info
  let trailingArgs: any[];

  const applyFn = (_this, args) => {
    currentPromise = _applyPromised(fn, _this, args);
    currentPromise.finally(() => {
      currentPromise = null;
      if (options.trailing && trailingArgs && !timeout) {
        const promise = applyFn(_this, trailingArgs);
        trailingArgs = null;
        return promise;
      }
    });
    return currentPromise;
  };

  return function (...args: ArgumentsT) {
    if (currentPromise) {
      if (options.trailing) {
        trailingArgs = args;
      }
      return currentPromise;
    }
    return new Promise<ReturnT>((resolve) => {
      const shouldCallNow = !timeout && options.leading;

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;
        const promise = options.leading ? leadingValue : applyFn(this, args);
        for (const _resolve of resolveList) {
          _resolve(promise);
        }
        resolveList = [];
      }, wait);

      if (shouldCallNow) {
        leadingValue = applyFn(this, args);
        resolve(leadingValue);
      } else {
        resolveList.push(resolve);
      }
    });
  };
}

async function _applyPromised(fn: () => any, _this: unknown, args: any[]) {
  return await fn.apply(_this, args);
}
