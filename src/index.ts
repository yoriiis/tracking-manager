declare global {
	interface Window {
		ga: (command: any, hitType: any, parameters?: any) => void
	}
}

export default class Tracking {
	selector: string
	config: any
	ignoreRedirectAttribute: string

	/**
	 * @param {Object} options Options parameters
	 * @param {Object} options.config Tracking config
	 */
	constructor({ config }: { config: any }) {
		this.selector = '[data-track]'
		this.config = config
		this.ignoreRedirectAttribute = 'data-no-tracking-redirect'

		this.trackClickEvent = this.trackClickEvent.bind(this)
	}

	/**
	 * Parse the DOM to search all tracking attributes
	 * @param {HTMLElement} domElement Target element to search "data-track" attributes
	 */
	parseDom(domElement: HTMLElement) {
		if (domElement && this.isGoogleAnalyticsAvailable()) {
			const elementsToTrack = [
				...domElement.querySelectorAll(`${this.selector}:not([tracking-parsed])`)
			]
			elementsToTrack.forEach((element) => {
				element.setAttribute('tracking-parsed', '')
				element.addEventListener('click', this.trackClickEvent)
			})
		}
	}

	/**
	 * Function to track page view event from Javascript
	 * @param {String} key Key of tracking datas
	 * @param {Object} replaceObj JSON with replacement keys
	 */
	trackPageView(key: string, pageView: any) {
		let dataTracking = {}
		const configEvent = this.getConfigEventFromKey(key)

		if (key && configEvent && pageView) {
			configEvent.pageView = pageView
			dataTracking = configEvent
		} else {
			throw new Error(`[Tracking -> trackPageView] key \`${key}\` undefined or unknown`)
		}

		this.sendPageView({
			key,
			json: dataTracking
		})
	}

	/**
	 * Function to track click event from Javascript
	 * @param {String} key Key of tracking datas
	 * @param {Object} replaceObj JSON with replacement keys
	 */
	trackEvent(key: string, replaceObj: any) {
		let dataTracking = {}
		const configEvent = this.getConfigEventFromKey(key)

		if (key && configEvent) {
			dataTracking = this.loopReplace(configEvent, replaceObj)
		} else {
			throw new Error(`[Tracking -> trackEvent] key \`${key}\` undefined or unknown`)
		}

		this.sendEvent({
			key,
			json: dataTracking
		})
	}

	/**
	 * Function to track click event from HTML
	 * @param {Object} e Event listener datas
	 */
	trackClickEvent(e: Event) {
		const element = e.currentTarget as HTMLElement
		const key = element.getAttribute('data-track-key') || ''
		const dataTrackParams = element.getAttribute('data-track-params')
		const isPageView = element.hasAttribute('data-track-page-view')
		let dataTracking = {}
		const callbackUrl = element.getAttribute('href') || false
		const targetAttribute = element.hasAttribute('target') || false

		// Prevent only when link has no target attribute
		if (!targetAttribute) {
			e.preventDefault()
		}

		// If tracking has dynamic variable
		const configEvent = this.getConfigEventFromKey(key)

		// Check if element contain page view attribute
		if (isPageView) {
			const pageView = element.getAttribute('data-track-page-view')

			configEvent.pageView = pageView
			dataTracking = configEvent

			// Send page view event
			this.sendPageView({
				key,
				json: dataTracking
			})
		} else {
			if (dataTrackParams !== null) {
				dataTracking = this.loopReplace(configEvent, JSON.parse(dataTrackParams))
			} else {
				dataTracking = configEvent
			}

			// Send event
			this.sendEvent({
				key,
				json: dataTracking,
				callbackUrl,
				targetAttribute,
				element
			})
		}
	}

	/**
	 * Function to replace all replacement keys from HTML
	 * @param {Object} obj Reference object from tracking datas
	 * @param {Object} replaceObj Replacement object from HTML
	 * @returns {Object} Object with all replacements
	 */
	loopReplace(obj: any, replaceObj: any) {
		let replacedObj = {}

		if (!replaceObj) {
			replacedObj = obj
		} else {
			const replaceExp = new RegExp(Object.keys(replaceObj).join('|'), 'gi')
			const replaceMatch = (matches: string) => replaceObj[matches]

			for (const key in obj) {
				// Apply the replacement only for string value
				if (typeof obj[key] === 'string') {
					// @ts-ignore
					replacedObj[key] = obj[key].replace(replaceExp, replaceMatch)
				} else {
					// @ts-ignore
					replacedObj[key] = obj[key]
				}
			}
		}

		return replacedObj
	}

	/**
	 * Send Google Analytics event with all parameters
	 * @param {Object} options Options parameters
	 * @param {String} options.key Key of tracking datas
	 * @param {Object} options.json Object to send to GA
	 * @param {(String|Boolean)} options.callbackUrl Url to redirect if necessary
	 * @param {Boolean} options.targetAttribute Is target attribute is present on the element
	 * @param {HTMLElement} options.element Source element of the event
	 */
	sendEvent({
		key,
		json = {},
		callbackUrl = false,
		targetAttribute = false,
		element = false
	}: {
		key: string
		json: any
		callbackUrl?: string | boolean
		targetAttribute?: boolean
		element?: boolean | HTMLElement
	}) {
		console.log('%c[Tracking -> trackEvent]:', 'color: DeepPink;', key, json, {
			callbackUrl,
			targetAttribute,
			element
		})

		if (
			this.needRedirectAfterEvent({
				element,
				callbackUrl,
				targetAttribute
			})
		) {
			json.hitCallback = () => {
				// @ts-ignore
				window.location.assign(callbackUrl)
			}
		}
		window.ga('send', json)
	}

	/**
	 * Send Google Analytics page view with all parameters
	 * @param {Object} options Options parameters
	 * @param {String} options.key Key of tracking datas
	 * @param {Object} options.json Object to send to GA
	 */
	sendPageView({ key, json }: { key: string; json: any }) {
		console.log('%c[Tracking -> trackPageView]:', 'color: DeepPink;', key, json)

		if (json.pageView) {
			window.ga('set', 'page', json.pageView)
			window.ga('send', 'pageView')
		}
	}

	/**
	 * Check if Google Analytics is available on the page
	 * @return {Boolean} Is Google Analytics available
	 */
	isGoogleAnalyticsAvailable(): boolean {
		return typeof window.ga !== 'undefined'
	}

	/**
	 * Transform key with dots notation into object keys with deep levels
	 * Then, search in the object tracking configuration
	 * @param {String} key Tracking configuration key
	 * @return {Object} Tracking configuration datas
	 */
	getConfigEventFromKey(key: string): any {
		return this.config[key]
	}

	/**
	 * Check if redirect is needed after the event
	 * @param {Object} options Options parameters
	 * @param {HTMLElement} options.element The HTML element which trigger the event
	 * @param {(String|Boolean)} options.callbackUrl The HTML element which trigger the event
	 * @param {HTMLElement} options.targetAttribute The HTML element which trigger the event
	 */
	needRedirectAfterEvent({
		element,
		callbackUrl,
		targetAttribute
	}: {
		element: HTMLElement | boolean
		callbackUrl: string | boolean
		targetAttribute: boolean
	}): boolean {
		return !!(
			callbackUrl &&
			callbackUrl !== '' &&
			callbackUrl !== '#' &&
			!targetAttribute &&
			// @ts-ignore
			!element.hasAttribute(this.ignoreRedirectAttribute)
		)
	}
}
