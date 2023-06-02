import { Config, jsonEvent, DataTrackParams, GaOptions } from './interface.js'

export default class Tracking {
	selector: string
	config: Config
	ignoreRedirectAttribute: string

	/**
	 * @param {Object} config Tracking config
	 */
	constructor(config: Config) {
		this.config = config
		this.selector = '[data-track]'
		this.ignoreRedirectAttribute = 'data-no-tracking-redirect'

		this.trackClickEvent = this.trackClickEvent.bind(this)
	}

	/**
	 * Parse the DOM to search all tracking attributes
	 * @param {HTMLElement} domElement Target element to search "data-track" attributes
	 */
	parseDom(domElement: HTMLElement) {
		;[...domElement.querySelectorAll(`${this.selector}:not([tracking-parsed])`)].forEach(
			(element) => {
				element.setAttribute('tracking-parsed', '')
				element.addEventListener('click', this.trackClickEvent)
			}
		)
	}

	/**
	 * Function to track click event from HTML
	 * @param {Object} e Event listener datas
	 */
	trackClickEvent(e: Event) {
		const element = e.currentTarget as HTMLElement
		const key = element.getAttribute('data-track-key') || ''
		const dataTrackParams = element.getAttribute('data-track-params')
		const hrefAttribute = element.getAttribute('href') || false
		const targetAttribute = element.hasAttribute('target') || false
		const configEvent = this.config[key] as jsonEvent
		let json = configEvent

		// Prevent only when link has no target attribute
		!targetAttribute && e.preventDefault()

		// If tracking has dynamic variable
		if (dataTrackParams !== null) {
			json = this.loopReplace(configEvent, JSON.parse(dataTrackParams))
		}

		if (hrefAttribute && !targetAttribute && !element.hasAttribute(this.ignoreRedirectAttribute)) {
			json.hitCallback = () => {
				window.location.assign(hrefAttribute)
			}
		}

		// Send event
		this.sendEvent(json)
	}

	/**
	 * Function to replace all replacement keys from HTML
	 * @param {ConfigItem} obj Reference object from tracking datas
	 * @param {DataTrackParams} replaceObj Replacement object from HTML
	 * @returns {Object} Object with all replacements
	 */
	loopReplace(obj: jsonEvent, replaceObj: DataTrackParams): jsonEvent {
		if (replaceObj) {
			const replacedObj = {} as jsonEvent
			const replaceExp = new RegExp(Object.keys(replaceObj).join('|'), 'gi')
			const replaceMatch = (matches: string) => replaceObj[matches]

			for (const key in obj) {
				const value = obj[key as keyof typeof obj]
				// Apply the replacement only for string value
				if (typeof value === 'string') {
					replacedObj[key] = value.replace(replaceExp, replaceMatch)
				} else {
					// @ts-ignore
					replacedObj[key] = value
				}
			}

			return replacedObj
		}

		return obj
	}

	/**
	 * Send Google Analytics event with all parameters
	 * @param {jsonEvent} json Object to send to GA
	 */
	sendEvent(json: jsonEvent) {
		window.ga('send', json)
	}

	/**
	 * Function to track click event from Javascript
	 * @param {String} key Key of tracking datas
	 * @param {DataTrackParams} replaceObj JSON with replacement keys
	 */
	trackEvent(key: string, replaceObj: DataTrackParams) {
		const configEvent = this.config[key] as jsonEvent

		if (configEvent) {
			this.sendEvent(this.loopReplace(configEvent, replaceObj))
		} else {
			throw new Error(`[Tracking -> trackEvent] key \`${key}\` undefined or unknown`)
		}
	}

	/**
	 * Function to track page view event from Javascript
	 * @param {String} value Page view name
	 */
	trackPageView(value: string) {
		window.ga('set', 'page', value)
		window.ga('send', 'pageView')
	}
}
