/**
 * @license MIT
 * @name tracking-manager
 * @version 1.0.0
 * @author: Yoriiis aka Joris DANIEL <joris.daniel@gmail.com>
 * @description: Tracking Manager allows to manage all your Google Analytics events directly in HTML or Javascript with a simple and extensible configuration and public functions to track events with dynamic variables
 * {@link https://github.com/yoriiis/tracking-manager}
 * @copyright 2020 Joris DANIEL
 **/

module.exports = class Tracking {
	/**
	 * Instanciate the constructor
	 *
	 * @param {Object} config Tracking configurations
	 * @param {Boolean} debug Debug mode
	 */
	constructor ({ config, debug = false }) {
		this.config = config;
		this.debug = debug;
		this.selector = '[data-track]';
		this.ignoreRedirectAttribute = 'data-no-tracking-redirect';
	}

	/**
	 * Instanciate the Tracking class
	 */
	init () {
		this.parseDOM();
	}

	/**
	 * Parse the DOM to search all tracking attributes
	 */
	parseDOM () {
		const elementsToTrack = [
			...document.querySelectorAll(`${this.selector}:not([tracking-parsed])`)
		];

		elementsToTrack.forEach(element => {
			element.setAttribute('tracking-parsed', '');
			element.addEventListener('click', this.trackClickEvent.bind(this), false);
		});
	}

	/**
	 * Function to track page view event from Javascript
	 *
	 * @param {String} key Key of tracking datas
	 * @param {Object} replaceObj JSON with replacement keys
	 */
	trackPageView (key, pageView) {
		let dataTracking = {};
		const configEvent = this.getConfigEventFromKey(key);

		if (key && configEvent && pageView) {
			configEvent.pageView = pageView;
			dataTracking = configEvent;
		} else {
			throw new Error(`[Tracking -> trackPageView] key \`${key}\` undefined or unknown`);
		}

		this.sendPageView({
			key: key,
			json: dataTracking
		});
	}

	/**
	 * Function to track click event from Javascript
	 *
	 * @param {String} key Key of tracking datas
	 * @param {Object} replaceObj JSON with replacement keys
	 */
	trackEvent (key, replaceObj) {
		let dataTracking = {};
		const configEvent = this.getConfigEventFromKey(key);

		if (key && configEvent) {
			dataTracking = this.loopReplace(configEvent, replaceObj);
		} else {
			throw new Error(`[Tracking -> trackEvent] key \`${key}\` undefined or unknown`);
		}

		this.sendEvent({
			key: key,
			json: dataTracking,
			callbackUrl: false,
			target: false
		});
	}

	/**
	 * Function to track click event from HTML
	 *
	 * @param {Object} e Event listener datas
	 */
	trackClickEvent (e) {
		const link = e.currentTarget;
		const key = link.getAttribute('data-track-key');
		const dataTrackParams = link.getAttribute('data-track-params');
		const isPageView = link.hasAttribute('data-track-page-view');
		let dataTracking = {};
		const href = link.getAttribute('href') || false;
		const target = link.getAttribute('target') || false;

		// Prevent only when link has no target attribute
		if (target === false) {
			e.preventDefault();
		}

		// If tracking has dynamic variable
		const configEvent = this.getConfigEventFromKey(key);

		// Check if element contain page view attribute
		if (isPageView) {
			const pageView = link.getAttribute('data-track-page-view');

			configEvent.pageView = pageView;
			dataTracking = configEvent;

			// Send page view event
			this.sendPageView({
				key: key,
				json: dataTracking
			});
		} else {
			if (dataTrackParams !== null) {
				dataTracking = this.loopReplace(configEvent, JSON.parse(dataTrackParams));
			} else {
				dataTracking = configEvent;
			}

			// Send event
			this.sendEvent({
				key: key,
				json: dataTracking,
				callbackUrl: href,
				target: target,
				element: link
			});
		}
	}

	/**
	 * Function to replace all replacement keys from HTML
	 *
	 * @param {Object} obj Reference object from tracking datas
	 * @param {Object} replaceObj Replacement object from HTML
	 */
	loopReplace (obj, replaceObj) {
		let replacedObj = {};

		if (!replaceObj) {
			replacedObj = obj;
		} else {
			const replaceExp = new RegExp(Object.keys(replaceObj).join('|'), 'gi');
			const replaceMatch = function (matches) {
				return replaceObj[matches];
			};

			for (const key in obj) {
				replacedObj[key] = obj[key].replace(replaceExp, replaceMatch);
			}
		}

		return replacedObj;
	}

	/**
	 * Send Google Analytics event with all parameters
	 *
	 * @param {String} key Key of tracking datas
	 * @param {Object} json Object to send to GA
	 * @param {String} callbackUrl Url to callback if preventDefault has been executed
	 * @param {Boolean} target Is target attribute is present on the element
	 * @param {Object} element Source element of the event
	 */
	sendEvent ({ key, json, callbackUrl, target, element = null }) {
		if (this.debug) {
			console.log('%c[Tracking -> trackEvent]:', 'color: DeepPink;', key, json, {
				callbackUrl: callbackUrl,
				target: target,
				element: element
			});
		}

		// Possibility to disable the redirect in case of JS events conflicts (with PMC for example)
		const ignoreRedirect =
			element !== null && element.hasAttribute(this.ignoreRedirectAttribute);

		if (this.isGoogleAnalyticsAvailable()) {
			// Redirect is necessary on event callback
			if (
				callbackUrl &&
				callbackUrl !== '' &&
				callbackUrl.indexOf('#') !== 0 &&
				!target &&
				!ignoreRedirect
			) {
				json.hitCallback = () => {
					window.location.assign(callbackUrl);
				};
			}

			window.ga('send', json);
		}
	}

	/**
	 * Send Google Analytics page view with all parameters
	 *
	 * @param {String} key Key of tracking datas
	 * @param {Object} json Object to send to GA
	 */
	sendPageView ({ key, json }) {
		if (this.debug) {
			console.log('%c[Tracking -> trackPageView]:', 'color: DeepPink;', key, json);
		}

		if (this.isGoogleAnalyticsAvailable() && json.pageView) {
			window.ga('set', 'page', json.pageView);
			window.ga('send', 'pageView');
		}
	}

	/**
	 * Check if Google Analytics is available on the page
	 *
	 * @return {Boolean} Is Google Analytics available
	 */
	isGoogleAnalyticsAvailable () {
		return typeof window.ga !== 'undefined';
	}

	/**
	 * Transform key with dots notation into object keys with deep levels
	 * Then, search in the object tracking configuration
	 *
	 * @param {String} key Tracking configuration key
	 *
	 * @return {Object} Tracking configuration datas
	 */
	getConfigEventFromKey (key) {
		return key
			.split('.')
			.reduce((accumulator, currentValue) => accumulator[currentValue], this.config);
	}
};
