# CHANGELOG

## 3.0.0

### ⚠️ Breaking changes

#### **This package is now pure ESM.** Please read [Sindre Sorhus ESM note](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) for more information

- Minimum supported `Node.js` version is `16.20.0` and package is ESM ([#13](https://github.com/yoriiis/tracking-manager/pull/13))

## 2.0.1

### Fixes

- Fix `loopReplace` when event object contains boolean

## 2.0.0

### Updates

- Move CI to GitHub Actions
- Update th node.js engine to `v12.14.0`
- Move the tracking configuration on each instance (tracking by components)

### Fixes

- `[data-track]` element are not longer blocked by a `preventDefault` when Google Analytics is not available (with an Ad blocker for example)

### Removes

- `debug` option is removed and the logs are always available. Use another tool to remove them (webpack, etc.)

## 1.0.1

### Updates

- Update Jest tests

## 1.0.0

### New features

- First release of `tracking-manager` 🚀
- Jest coverage of 100%
