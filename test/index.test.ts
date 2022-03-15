import { setTimeout as delay } from 'timers/promises'
import { test, expect } from 'vitest'
import inRange from 'in-range'
import timeSpan from 'time-span'
import { debounce } from '../src'

const fixture = 'fixture'

test.concurrent('single call', async () => {
  const debounced = debounce(async value => value, 100)
  expect(await debounced(fixture)).toBe(fixture)
})

test.concurrent('multiple calls', async () => {
  let count = 0
  const end = timeSpan()

  const debounced = debounce(async (value) => {
    count++
    await delay(50)
    return value
  }, 100)

  const results = await Promise.all([1, 2, 3, 4, 5].map(value => debounced(value)))

  expect(results).toMatchObject([5, 5, 5, 5, 5])
  expect(count).toBe(1)
  expect(inRange(end(), {
    start: 130,
    end: 170
  })).toBe(true)

  await delay(110)
  expect(await debounced(6)).toBe(6)
})

test.concurrent('before option', async () => {
  let count = 0

  const debounced = debounce(async (value) => {
    count++
    await delay(50)
    return value
  }, 100, { before: true })

  const results = await Promise.all([1, 2, 3, 4].map(value => debounced(value)))

  // value from the first promise is used without the timeout
  expect(results).toEqual([1, 1, 1, 1])
  expect(count).toBe(1)

  await delay(200)
  expect(await debounced(5)).toBe(5)
  expect(await debounced(6)).toBe(5)
})

test.concurrent('before option - does not call input function after timeout', async () => {
  let count = 0

  const debounced = debounce(async () => {
    count++
  }, 100, { before: true })

  await delay(300)
  await debounced()

  expect(count).toBe(1)
})

test.concurrent('fn takes longer than wait', async () => {
  let count = 0

  const debounced = debounce(async (value) => {
    count++
    await delay(200)
    return value
  }, 100)

  const setOne = [1, 2, 3]
  const setTwo = [4, 5, 6]

  const promiseSetOne = setOne.map(value => debounced(value))
  await delay(101)
  const promiseSetTwo = setTwo.map(value => debounced(value))

  const results = await Promise.all([...promiseSetOne, ...promiseSetTwo])

  expect(results).toMatchObject([3, 3, 3, 6, 6, 6])
  expect(count).toBe(2)
})

// Factory to create a separate class for each test below
// * Each test replaces methods in the class with a debounced variant,
//   hence the need to start with fresh class for each test.
const createFixtureClass = () => class {
  _foo = 'fixture'

  foo () {
    // If `this` is not preserved by `debounce()` or `debounce.promise()`,
    // then `this` will be undefined and accessing `this._foo` will throw.
    return this._foo
  }

  getThis () {
    // If `this` is not preserved by `debounce()` or `debounce.promise()`,
    // then `this` will be undefined.
    return this
  }
}

test.concurrent('`this` is preserved ', async () => {
  const FixtureClass = createFixtureClass()
  FixtureClass.prototype.foo = (debounce as Function)(FixtureClass.prototype.foo, 10)
  FixtureClass.prototype.getThis = (debounce as Function)(FixtureClass.prototype.getThis, 10)

  const thisFixture = new FixtureClass()

  expect(await thisFixture.getThis()).toBe(thisFixture)
  expect(() => thisFixture.foo()).not.throws()
  expect(await thisFixture.foo()).toBe(fixture)
})

test.concurrent('waitForPromise', async () => {
  const results = []

  const EXEC_MS = 200
  const DEBOUNCE_MS = 50
  const REPEAT_MS = 100

  const debounced = debounce(async (value) => {
    await delay(EXEC_MS)
    results.push(value)
    return value
  }, DEBOUNCE_MS, { waitForPromise: true })

  const promises = []
  for (const i of [1, 2, 3, 4, 5]) {
    promises.push(debounced(i))
    await delay(REPEAT_MS)
  }
  const resolvedResults = await Promise.all(promises)

  console.log('Results:', results)
  console.log('Resolved results:', resolvedResults)
  // expect(results).toMatchObject([5])
})
