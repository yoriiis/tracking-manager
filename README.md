# trackingManager

![trackingManager](https://img.shields.io/badge/tracking--manager-v2.0.1-546e7a.svg?style=for-the-badge) [![TravisCI](https://img.shields.io/travis/com/yoriiis/tracking-manager/master?style=for-the-badge)](https://travis-ci.com/yoriiis/tracking-manager) [![Coverage Status](https://img.shields.io/coveralls/github/yoriiis/tracking-manager?style=for-the-badge)](https://coveralls.io/github/yoriiis/tracking-manager?branch=master) ![Node.js](https://img.shields.io/node/v/tracking-manager?style=for-the-badge) [![Bundlephobia](https://img.shields.io/bundlephobia/minzip/tracking-manager?style=for-the-badge)](https://bundlephobia.com/result?p=tracking-manager@latest)

The `trackingManager` allows to manage all your Google Analytics events directly in HTML or Javascript with a simple and extensible configuration and public functions to track events with dynamic variables. The concept is compatible with a site with a large number of events to manage.

## Installation

The plugin is available as the `tracking-manager` package name on [npm](https://www.npmjs.com/package/tracking-manager) and [Github](https://github.com/yoriiis/tracking-manager).

```bash
npm install tracking-manager --save
```

```bash
yarn add tracking-manager
```

## Environment

`trackingManager` was built for Node.js `>=8.11.2`.

## Configuration

### Simple trackings configuration

> Trackings configuration must be stores as valid JSON format.

The following example store tracking configuration of a click event into the key `burgerMenu_onClick`.

```json
{
  "burgerMenu_onClick": {
    "hitType": "event",
    "eventCategory": "Header",
    "eventAction": "Click",
    "eventLabel": "Click on burger menu"
  }
}
```

### Nested trackings configuration

Nested levels are **unlimited** to provide you the best flexibility to sort trackings configurations.

The following example store tracking configuration of a click event into the key `header.burgerMenu_onClick`.

```json
{
  "header": {
    "burgerMenu_onClick": {
      "hitType": "event",
      "eventCategory": "Header",
      "eventAction": "Click",
      "eventLabel": "Click on burger menu"
    }
  }
}
```

### Dynamic variable in trackings configuration

To use dynamic variables, wrapped the variable name with a placeholder of your choice. In the following example, the variable `{isConnected}` will be transformed.

> It is better to choose a placeholder to wrap variable name to avoid conflict with a real word.

```json
{
  "burgerMenu_onClick": {
    "hitType": "event",
    "eventCategory": "Header",
    "eventAction": "Click",
    "eventLabel": "Click on burger menu {isConnected}"
  }
}
```

## Usage

### Initialize the tracking manager

The `TrackingManager` is designed to work by component, each components has their own configuration.

First, import the `tracking-manager` package.

```javascript
import TrackingManager from 'tracking-manager';
```

Next, initialize the tracking manager with the tracking configuration.

```javascript
const trackingManager = new TrackingManager({
  config: {
    burgerMenu_onClick: {
      hitType: 'event',
      eventCategory: 'Header',
      eventAction: 'Click',
      eventLabel: 'Click on burger menu {isConnected}'
    }
  }
});
```

> 💡 The tracking configuration can be outsourced in a separate file and import before the initialize.

If the tracking is set in HTML, you need to call the `parseDom` with the target HTML element. The function will parse the element and add event listeners on all `data-track` HTML elements found inside the target element.

```html
<div class="component">
  <button
    class="track-button"
    data-track
    data-track-key="burgerMenu_onClick"
    data-track-params='{"{isConnected}": "true"}'
  ></button>
</div>
```

```javascript
trackingManager.parseDom(document.querySelector('.component'));
```

> Parsed element has an attribute `tracking-parsed` to prevent multiple parsing.
>
> 💡 If the `[data-track]` element is a link with an `href` attribute and the redirect must not be triggered by the tracking manager, add the `data-no-tracking-redirect` attribut on the element.

### Events tracking

The `TrackingManager` can be used from HTML or in Javascript, depending on your needs.

Following examples will uses the tracking configuration describes below.

```json
{
  "burgerMenu_onClick": {
    "hitType": "event",
    "eventCategory": "Header",
    "eventAction": "Click",
    "eventLabel": "Click on burger menu {isConnected}"
  },
  "homepage": {
    "pageView": "Home"
  },
  "infiniteScroll": {
    "pageView": "{pageCounter}"
  }
}
```

#### Track events from HTML

The following example track click event for the key `burgerMenu_onClick`.

```html
<button data-track data-track-key="burgerMenu_onClick"></button>
```

#### Track dynamic events from HTML

The following example track click event for the key `burgerMenu_onClick` with the dynamic variable `{isConnected}`.

Add the data attribute `data-track-params` with a JSON as value to replace dynamic variables. Position of JSON variables in tracking configurations doesn't matter, the function will automatically search variables to replace.

```html
<button
  data-track
  data-track-key="burgerMenu_onClick"
  data-track-params='{"{isConnected}": "true"}'
></button>
```

#### Track events from Javascript

The following example track click event for the key `burgerMenu_onClick`.

```javascript
trackingManager.trackEvent('burgerMenu_onClick');
```

#### Track dynamic events from Javascript

The following example track click event for the key `burgerMenu_onClick` with dynamic variable `{isConnected}`.

Add parameter to the function `trackEvent` like the following example to replace dynamic variables.

```javascript
trackingManager.trackEvent('burgerMenu_onClick', {
  '{isConnected}': true
});
```

### Page view tracking

#### Track page view from HTML

The following example track page view for the key `burgerMenu_onClick`.

```html
<button data-track data-track-page-view data-track-key="homepage"></button>
```

#### Track page view from Javascript

The following example track page view for the key `infiniteScroll` with the dynamic variable `{pageCounter}`.

```javascript
trackingManager.trackPageView('infiniteScroll', {
  '{pageCounter}': 2
});
```

## Available methods

### `parseDom`

Trigger a DOM parsing and add event listeners on all `data-track` HTML elements.

### `trackEvent` and `trackPageView`

Tracking functions can be used with same parameters definition.

#### Parameters

#### `first parameter`

`String`

Tells to the function the trackings configuration key.

#### `second parameter`

`Object`

Tells to the function the values of the dynamic variables.

## Licence

`trackingManager` is licensed under the [MIT License](http://opensource.org/licenses/MIT).

Created with ♥ by [@yoriiis](http://github.com/yoriiis).
