/**
 * @license MIT
 * @name tracking-manager
 * @version 2.0.1
 * @author: Yoriiis aka Joris DANIEL <joris.daniel@gmail.com>
 * @description: Tracking Manager allows to manage all your Google Analytics events directly in HTML or Javascript with a simple and extensible configuration and public functions to track events with dynamic variables
 * {@link https://github.com/yoriiis/tracking-manager}
 * @copyright 2021 Joris DANIEL
 **/

module.exports = class Tracking {
	/**
	 *
	 * @param {Object} options Options parameters
	 * @param {Object} options.config Tracking config
	 */
	constructor({ config }) {
		this.selector = '[data-track]';
		this.config = config;
		this.ignoreRedirectAttribute = 'data-no-tracking-redirect';
		this.trackClickEvent = this.trackClickEvent.bind(this);
	}

	/**
	 * Parse the DOM to search all tracking attributes
	 *
	 * @param {HTMLElement} domElement Target element to search "data-track" attributes
	 */
	parseDom(domElement) {
		if (domElement && this.isGoogleAnalyticsAvailable(domElement)) {
			const elementsToTrack = [
				...domElement.querySelectorAll(`${this.selector}:not([tracking-parsed])`)
			];
			elementsToTrack.forEach((element) => {
				element.setAttribute('tracking-parsed', '');
				element.addEventListener('click', this.trackClickEvent);
			});
		}
	}

	/**
	 * Function to track page view event from Javascript
	 *
	 * @param {String} key Key of tracking datas
	 * @param {Object} replaceObj JSON with replacement keys
	 */
	trackPageView(key, pageView) {
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
	trackEvent(key, replaceObj) {
		let dataTracking = {};
		const configEvent = this.getConfigEventFromKey(key);

		if (key && configEvent) {
			dataTracking = this.loopReplace(configEvent, replaceObj);
		} else {
			throw new Error(`[Tracking -> trackEvent] key \`${key}\` undefined or unknown`);
		}

		this.sendEvent({
			key: key,
			json: dataTracking
		});
	}

	/**
	 * Function to track click event from HTML
	 *
	 * @param {Object} e Event listener datas
	 */
	trackClickEvent(e) {
		const element = e.currentTarget;
		const key = element.getAttribute('data-track-key');
		const dataTrackParams = element.getAttribute('data-track-params');
		const isPageView = element.hasAttribute('data-track-page-view');
		let dataTracking = {};
		const callbackUrl = element.getAttribute('href') || false;
		const targetAttribute = element.getAttribute('target') || false;

		// Prevent only when link has no target attribute
		if (!targetAttribute) {
			e.preventDefault();
		}

		// If tracking has dynamic variable
		const configEvent = this.getConfigEventFromKey(key);

		// Check if element contain page view attribute
		if (isPageView) {
			const pageView = element.getAttribute('data-track-page-view');

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
				key,
				json: dataTracking,
				callbackUrl,
				targetAttribute,
				element
			});
		}
	}

	/**
	 * Function to replace all replacement keys from HTML
	 *
	 * @param {Object} obj Reference object from tracking datas
	 * @param {Object} replaceObj Replacement object from HTML
	 *
	 * @returns {Object} Object with all replacements
	 */
	loopReplace(obj, replaceObj) {
		let replacedObj = {};

		if (!replaceObj) {
			replacedObj = obj;
		} else {
			const replaceExp = new RegExp(Object.keys(replaceObj).join('|'), 'gi');
			const replaceMatch = (matches) => replaceObj[matches];

			for (const key in obj) {
				// Apply the replacement only for string value
				if (typeof obj[key] === 'string') {
					replacedObj[key] = obj[key].replace(replaceExp, replaceMatch);
				} else {
					replacedObj[key] = obj[key];
				}
			}
		}

		return replacedObj;
	}

	/**
	 * Send Google Analytics event with all parameters
	 *
	 * @param {Object} options Options parameters
	 * @param {String} options.key Key of tracking datas
	 * @param {Object} options.json Object to send to GA
	 * @param {(String|Boolean)} options.callbackUrl Url to redirect if necessary
	 * @param {Boolean} options.targetAttribute Is target attribute is present on the element
	 * @param {(Object|Boolean)} options.element Source element of the event
	 */
	sendEvent({ key, json = {}, callbackUrl = false, targetAttribute = false, element = false }) {
		console.log('%c[Tracking -> trackEvent]:', 'color: DeepPink;', key, json, {
			callbackUrl,
			targetAttribute,
			element
		});

		if (
			this.needRedirectAfterEvent({
				element,
				callbackUrl,
				targetAttribute
			})
		) {
			json.hitCallback = () => {
				window.location.assign(callbackUrl);
			};
		}
		window.ga('send', json);
	}

	/**
	 * Send Google Analytics page view with all parameters
	 *
	 * @param {Object} options Options parameters
	 * @param {String} options.key Key of tracking datas
	 * @param {Object} options.json Object to send to GA
	 */
	sendPageView({ key, json }) {
		console.log('%c[Tracking -> trackPageView]:', 'color: DeepPink;', key, json);

		if (json.pageView) {
			window.ga('set', 'page', json.pageView);
			window.ga('send', 'pageView');
		}
	}

	/**
	 * Check if Google Analytics is available on the page
	 *
	 * @return {Boolean} Is Google Analytics available
	 */
	isGoogleAnalyticsAvailable() {
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
	getConfigEventFromKey(key) {
		return key
			.split('.')
			.reduce((accumulator, currentValue) => accumulator[currentValue], this.config);
	}

	/**
	 * Check if redirect is needed after the event
	 *
	 * @param {Object} options Options parameters
	 * @param {HTMLElement} options.callbackUrl The HTML element which trigger the event
	 * @param {HTMLElement} options.targetAttribute The HTML element which trigger the event
	 * @param {HTMLElement} options.element The HTML element which trigger the event
	 */
	needRedirectAfterEvent({ callbackUrl, targetAttribute, element }) {
		return !!(
			callbackUrl &&
			callbackUrl !== '' &&
			callbackUrl !== '#' &&
			!targetAttribute &&
			!element.hasAttribute(this.ignoreRedirectAttribute)
		);
	}
};
