# trackingManager

![trackingManager](https://img.shields.io/badge/tracking--manager-v1.0.0-546e7a.svg?style=for-the-badge) [![TravisCI](https://img.shields.io/travis/com/yoriiis/tracking-manager/master?style=for-the-badge)](https://travis-ci.com/yoriiis/tracking-manager) [![Coverage Status](https://img.shields.io/coveralls/github/yoriiis/tracking-manager?style=for-the-badge)](https://coveralls.io/github/yoriiis/tracking-manager?branch=master) ![Node.js](https://img.shields.io/node/v/tracking-manager?style=for-the-badge) [![Bundlephobia](https://img.shields.io/bundlephobia/minzip/tracking-manager?style=for-the-badge)](https://bundlephobia.com/result?p=tracking-manager@latest)

`trackingManager` allows to manage all your Google Analytics events directly in HTML or Javascript with a simple and extensible configuration and public functions to track events with dynamic variables. The concept is compatible with a site with a large number of events to manage.

## Installation

The plugin is available as the `tracking-manager` package name on [npm](https://www.npmjs.com/package/tracking-manager) and [Github](https://github.com/yoriiis/tracking-manager).

```bash
npm i --save-dev tracking-manager
```

```bash
yarn add --dev tracking-manager
```

## Environment

`trackingManager` was built for Node.js `>=8.11.2`.

## Configuration

### Simple trackings configuration

> Trackings configuration must be stores as valid JSON format.

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
    },
    "homepage": {
        "pageView": "Home"
    }
}
```

### Nested trackings configuration

Nested levels are **unlimited** to provide you the best flexibility to sort trackings configurations.

The following example store tracking configuration of a click event into the key `common.header.burgerMenu_onClick`.

```json
{
    "common": {
        "header": {
            "burgerMenu_onClick": {
                "hitType": "event",
                "eventCategory": "Header",
                "eventAction": "Click",
                "eventLabel": "Click on burger menu"
            }
        }
    },
    "homepage": {
        "pageView": "Home"
    }
}
```

### Dynamic variable in trackings configuration

Dynamic variable must be formatted as `{variableName}` syntax.

```json
{
    "header": {
        "burgerMenu_onClick": {
            "hitType": "event",
            "eventCategory": "Header",
            "eventAction": "Click",
            "eventLabel": "Click on burger menu {isConnected}"
        }
    },
    "newsInfiniteScroll": {
        "pageView": "{pageCounter}"
    }
}
```

## Usage

### Initialize the tracking manager

First, import the JSON configuration file and the `trackingManager` script.

```javascript
const configTracking = require('./config-tracking');
const TrackingManager = require('tracking-manager');
```

Next, initialize the tracking manager.

```javascript
const trackingManager = new TrackingManager({
    config: configTracking
});
```

Call the `init` function to trigger a DOM parsing and add event listeners on all `data-track` HTML elements.

```javascript
trackingManager.init()
```

### Events tracking

Tracking manager can be use from HTML or in Javascript, depending on your needs.

> Following examples uses tracking configuration describes at [the top of the readme file](#Configuration)

#### Track events from HTML

The following example track click event for the key `header.burgerMenu_onClick`.

```html
<button
    data-track
    data-track-key="header.burgerMenu_onClick"
>
</button>
```

#### Track dynamic events from HTML

The following example track click event for the key `header.burgerMenu_onClick` with dynamic variable `{isConnected}`.

Add data attribute `data-track-params` with a JSON as value to replace dynamic variables. Position of JSON variables in tracking configurations doesn't matter, the function will automatically search variables to replace.

```html
<button
    data-track
    data-track-key="header.burgerMenu_onClick"
    data-track-params='{"{isConnected}": "true","{pageCounter}": "1"}'
>
</button>
```

#### Track events from Javascript

The following example track click event for the key `header.burgerMenu_onClick`.

```javascript
trackingManager.trackEvent('header.burgerMenu_onClick');
```

#### Track dynamic events from Javascript

The following example track click event for the key `header.burgerMenu_onClick` with dynamic variable `{isConnected}`.

Add parameter to the function `trackEvent` like the following example to replace dynamic variables.

```javascript
trackingManager.trackEvent('header.burgerMenu_onClick', {
    '{isConnected}': true
    '{pageCounter}': 1
});
```

### Page view tracking

#### Track page view from HTML

The following example track page view for the key `header.burgerMenu_onClick`.

```html
<button
    data-track
    data-track-page-view
    data-track-key="homepage"
>
</button>
```

#### Track page view from Javascript

The following example track page view for the key `newsInfiniteScroll` with dynamic variable `{pageCounter}`.

```javascript
trackingManager.trackPageView('newsInfiniteScroll', {
    '{pageCounter}': 2
});
```

## Debug mode

Debug option is available on the constructor to log all tracking in the browser devtools.

```javascript
new TrackingManager({
    debug: true
});
```

## Available methods

### `init`

Trigger a DOM parsing and add event listeners on all `data-track` HTML elements.

### `trackEvent` and `trackPageView`

Tracking functions can be used with same parameters definition.

#### Parameters

#### `first parameter`

`String`

Tells to the function the trackings configuration key.

#### `second parameter`

`Object`

Tells to the function the values of dynamic variables.

## Licence

`trackingManager` is licensed under the [MIT License](http://opensource.org/licenses/MIT).

Created with ♥ by [@yoriiis](http://github.com/yoriiis).
