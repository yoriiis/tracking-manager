import { jest } from '@jest/globals'
import { mockGetConfigEventFromKey, mockLoopReplace } from './__mocks__/mocks'

const TrackingManager = (await import('../src/index')).default

let trackingManager
const configTracking = {
	header: {
		burgerMenu_onClick: {
			hitType: 'event',
			eventCategory: 'header',
			eventAction: 'display',
			eventLabel: 'burger menu - {user} {isConnected}',
			nonInteraction: true
		}
	},

	newsInfiniteScroll: {
		pageView: '{pageView}'
	}
}

const jsonEvent = {
	hitType: 'event',
	eventCategory: 'header',
	eventAction: 'display',
	eventLabel: 'burger menu - Jest true',
	nonInteraction: true
}
const jsonPageView = {
	pageView: 'Home'
}

const getInstance = () =>
	new TrackingManager({
		config: configTracking
	})

beforeEach(() => {
	document.body.innerHTML = `
		<div class="component">
			<a
				href="http://www.google.fr"
				target="_blank"
				class="track-link"
				data-track
				data-track-key="header.burgerMenu_onClick"
				data-track-params='{"{isConnected}": "true","{user}": "Jest"}'
			></a>
			<a
				href="http://www.google.fr"
				target="_blank"
				class="track-link-without-params"
				data-track
				data-track-key="header.burgerMenu_onClick"
			></a>
			<a
				href="http://www.google.fr"
				target="_blank"
				class="track-page-view-link"
				data-track-page-view="Home"
				data-track
				data-track-key="newsInfiniteScroll"
			></a>
			<button
				class="track-button"
				data-track
				data-track-key="header.burgerMenu_onClick"
				data-track-params='{"{isConnected}": "true","{user}": "Jest"}'
			></button>
		</div>
	`

	Object.defineProperty(window, 'ga', {
		writable: true,
		value: () => {}
	})

	Object.defineProperty(window, 'location', {
		writable: true,
		value: {
			assign: () => {},
			href: 'http://localhost/'
		}
	})

	Object.defineProperty(window, 'dataLayer', {
		writable: true,
		value: {
			push: jest.fn()
		}
	})

	trackingManager = getInstance()
})

describe('TrackingManager constructor', () => {
	it('Should initialize the constructor', () => {
		expect(trackingManager.selector).toBe('[data-track]')
		expect(trackingManager.config).toMatchObject(configTracking)
		expect(trackingManager.ignoreRedirectAttribute).toBe('data-no-tracking-redirect')
	})
})

describe('Tracking parseDom', () => {
	it('Initialize the parseDom function with GA and a DOM element', () => {
		trackingManager.isGoogleAnalyticsAvailable = jest.fn().mockReturnValue(true)

		const element = document.querySelector('.track-button')
		element.addEventListener = jest.fn()

		trackingManager.parseDom(document.querySelector('.component'))

		expect(trackingManager.isGoogleAnalyticsAvailable).toHaveBeenCalled()
		expect(element.hasAttribute('tracking-parsed')).toBe(true)
		expect(element.addEventListener).toHaveBeenCalledWith('click', trackingManager.trackClickEvent)
	})

	it('Initialize the parseDom function with the tracking unavailable', () => {
		trackingManager.isGoogleAnalyticsAvailable = jest.fn().mockReturnValue(false)

		const element = document.querySelector('.track-button')
		element.addEventListener = jest.fn()

		trackingManager.parseDom(document.querySelector('.component'))

		expect(element.hasAttribute('tracking-parsed')).toBe(false)
		expect(element.addEventListener).not.toHaveBeenCalled()
	})

	it('Initialize the parseDom function without the dom element', () => {
		trackingManager.isGoogleAnalyticsAvailable = jest.fn().mockReturnValue(true)

		trackingManager.parseDom()

		expect(trackingManager.isGoogleAnalyticsAvailable).not.toHaveBeenCalled()
	})
})

describe('TrackingManager trackPageView', () => {
	it('Should call the trackPageView function', () => {
		const key = 'newsInfiniteScroll'

		mockGetConfigEventFromKey({ trackingManager, key, configTracking })
		trackingManager.sendPageView = jest.fn()

		trackingManager.trackPageView(key, 'Home')

		expect(trackingManager.getConfigEventFromKey).toHaveBeenCalledWith(key)
		expect(trackingManager.sendPageView).toHaveBeenCalledWith({
			key: 'newsInfiniteScroll',
			json: jsonPageView
		})
	})

	it('Should call the trackPageView function with unknown key', () => {
		const key = 'test'

		mockGetConfigEventFromKey({ trackingManager, key, configTracking })

		expect(() => {
			trackingManager.trackPageView(key, 'home')
		}).toThrow(new Error('[Tracking -> trackPageView] key `test` undefined or unknown'))
	})
})

describe('TrackingManager trackEvent', () => {
	it('Should call the trackEvent function', () => {
		const key = 'header.burgerMenu_onClick'

		mockGetConfigEventFromKey({ trackingManager, key, configTracking })
		trackingManager.sendEvent = jest.fn()

		trackingManager.trackEvent(key, {
			'{isConnected}': true,
			'{user}': 'Jest'
		})

		expect(trackingManager.getConfigEventFromKey).toHaveBeenCalledWith(key)
		expect(trackingManager.sendEvent).toHaveBeenCalledWith({
			key,
			json: jsonEvent
		})
	})

	it('Should call the trackEvent function with unknown key', () => {
		const key = 'test'

		mockGetConfigEventFromKey({ trackingManager, key, configTracking })

		expect(() => {
			trackingManager.trackEvent(key, 'home')
		}).toThrow(new Error('[Tracking -> trackEvent] key `test` undefined or unknown'))
	})
})

describe('TrackingManager trackClickEvent', () => {
	it('Should call the trackClickEvent function with a button', () => {
		const key = 'header.burgerMenu_onClick'
		const element = document.querySelector('.track-button')

		mockGetConfigEventFromKey({ trackingManager, key, configTracking })
		mockLoopReplace(trackingManager, jsonEvent)
		trackingManager.sendEvent = jest.fn()

		trackingManager.trackClickEvent({
			preventDefault: () => {},
			currentTarget: element
		})

		expect(trackingManager.getConfigEventFromKey).toHaveBeenCalledWith(key)
		expect(trackingManager.loopReplace).toHaveBeenCalled()
		expect(trackingManager.sendEvent).toHaveBeenCalledWith({
			key,
			json: jsonEvent,
			callbackUrl: false,
			targetAttribute: false,
			element
		})
	})

	it('Should call the trackClickEvent function with a link', () => {
		const key = 'header.burgerMenu_onClick'
		const element = document.querySelector('.track-link')

		mockGetConfigEventFromKey({ trackingManager, key, configTracking })
		mockLoopReplace(trackingManager, jsonEvent)
		trackingManager.sendEvent = jest.fn()

		trackingManager.trackClickEvent({
			preventDefault: () => {},
			currentTarget: element
		})

		expect(trackingManager.getConfigEventFromKey).toHaveBeenCalledWith(key)
		expect(trackingManager.sendEvent).toHaveBeenCalledWith({
			key,
			json: jsonEvent,
			callbackUrl: 'http://www.google.fr',
			targetAttribute: '_blank',
			element
		})
	})

	it('Should call the trackClickEvent function with a link with parameters', () => {
		const key = 'header.burgerMenu_onClick'
		const element = document.querySelector('.track-link-without-params')

		mockGetConfigEventFromKey({ trackingManager, key, configTracking })
		mockLoopReplace(trackingManager, jsonEvent)
		trackingManager.sendEvent = jest.fn()

		trackingManager.trackClickEvent({
			preventDefault: () => {},
			currentTarget: element
		})

		expect(trackingManager.sendEvent).toHaveBeenCalledWith({
			key,
			json: configTracking.header.burgerMenu_onClick,
			callbackUrl: 'http://www.google.fr',
			targetAttribute: '_blank',
			element
		})
	})

	it('Initialize the trackClickEvent function with a link and trigger paveView', () => {
		const key = 'newsInfiniteScroll'
		const element = document.querySelector('.track-page-view-link')

		mockGetConfigEventFromKey({ trackingManager, key, configTracking })
		mockLoopReplace(trackingManager, jsonEvent)
		trackingManager.sendPageView = jest.fn()

		trackingManager.trackClickEvent({
			preventDefault: () => {},
			currentTarget: element
		})

		expect(trackingManager.sendPageView).toHaveBeenCalledWith({
			key,
			json: jsonPageView
		})
	})
})

describe('TrackingManager loopReplace', () => {
	it('Should call the loopReplace function', () => {
		const objectReference = configTracking.header.burgerMenu_onClick
		const objectReplace = document.querySelector('.track-button').getAttribute('data-track-params')
		const result = trackingManager.loopReplace(objectReference, JSON.parse(objectReplace))

		expect(result).toMatchObject(jsonEvent)
	})

	it('Should call the loopReplace function without replace object', () => {
		const objectReference = configTracking.header.burgerMenu_onClick
		const result = trackingManager.loopReplace(objectReference)

		expect(result).toMatchObject(objectReference)
	})
})

describe('TrackingManager sendEvent', () => {
	it('Initialize the sendEvent function', () => {
		const key = 'header.burgerMenu_onClick'
		const callbackUrl = 'http://www.google.fr'
		const element = document.querySelector('.track-link')
		const targetAttribute = '_blank'

		console.log = jest.fn()
		trackingManager.needRedirectAfterEvent = jest.fn().mockReturnValue(false)
		window.location.assign = jest.fn()
		window.ga = jest.fn()

		trackingManager.sendEvent({
			key,
			json: jsonEvent,
			callbackUrl,
			targetAttribute,
			element
		})

		expect(console.log).toBeCalledWith(
			'%c[Tracking -> trackEvent]:',
			'color: DeepPink;',
			key,
			jsonEvent,
			{
				callbackUrl,
				targetAttribute,
				element
			}
		)
		expect(trackingManager.needRedirectAfterEvent).toHaveBeenCalledWith({
			element,
			callbackUrl,
			targetAttribute
		})
		expect(window.location.assign).not.toHaveBeenCalledWith()
		expect(window.ga).toHaveBeenCalledWith('send', jsonEvent)
	})

	it('Initialize the sendEvent function with hit callback', () => {
		const callbackUrl = 'http://localhost/'
		jsonEvent.hitCallback = () => {
			window.location.assign(callbackUrl)
		}

		console.log = jest.fn()
		trackingManager.needRedirectAfterEvent = jest.fn().mockReturnValue(true)
		window.location.assign = jest.fn()
		window.ga = jest.fn()

		trackingManager.sendEvent({
			key: 'header.burgerMenu_onClick',
			json: jsonEvent,
			callbackUrl,
			targetAttribute: false,
			element: document.querySelector('.track-link')
		})
		jsonEvent.hitCallback()

		expect(window.location.assign).toHaveBeenCalledWith(callbackUrl)
	})

	it('Initialize the sendEvent function with default parameters', () => {
		const callbackUrl = 'http://localhost/'
		jsonEvent.hitCallback = () => {
			window.location.assign(callbackUrl)
		}

		console.log = jest.fn()
		trackingManager.needRedirectAfterEvent = jest.fn().mockReturnValue(false)
		window.location.assign = jest.fn()
		window.ga = jest.fn()

		trackingManager.sendEvent({
			key: 'header.burgerMenu_onClick'
		})

		expect(trackingManager.needRedirectAfterEvent).toHaveBeenCalledWith({
			callbackUrl: false,
			targetAttribute: false,
			element: false
		})
		expect(window.ga).toHaveBeenCalledWith('send', {})
	})
})

describe('TrackingManager sendPageView', () => {
	it('Should call the sendPageView function', () => {
		window.ga = jest.fn()
		console.log = jest.fn()

		trackingManager.sendPageView({
			key: 'header.burgerMenu_onClick',
			json: jsonPageView
		})

		expect(console.log).toBeCalledWith(
			'%c[Tracking -> trackPageView]:',
			'color: DeepPink;',
			'header.burgerMenu_onClick',
			jsonPageView
		)
		expect(window.ga).toHaveBeenCalledWith('set', 'page', 'Home')
		expect(window.ga).toHaveBeenCalledWith('send', 'pageView')
	})

	it('Should call the sendPageView function without json', () => {
		window.ga = jest.fn()
		console.log = jest.fn()

		trackingManager.sendPageView({
			key: 'header.burgerMenu_onClick',
			json: {}
		})

		expect(window.ga).not.toHaveBeenCalled()
	})
})

describe('TrackingManager isGoogleAnalyticsAvailable', () => {
	it('Should call the isGoogleAnalyticsAvailable function with GA available', () => {
		expect(trackingManager.isGoogleAnalyticsAvailable()).toBe(true)
	})

	it('Should call the isGoogleAnalyticsAvailable function with GA not available', () => {
		window.ga = undefined

		expect(trackingManager.isGoogleAnalyticsAvailable()).toBe(false)
	})
})

describe('TrackingManager getConfigEventFromKey', () => {
	it('Should call the getConfigEventFromKey function', () => {
		const result = trackingManager.getConfigEventFromKey('header.burgerMenu_onClick')

		expect(result).toBe(configTracking.header.burgerMenu_onClick)
	})
})

describe('TrackingManager needRedirectAfterEvent', () => {
	it('Should call the needRedirectAfterEvent function all valid conditions', () => {
		const result = trackingManager.needRedirectAfterEvent({
			callbackUrl: 'http://localhost',
			targetAttribute: false,
			element: document.querySelector('.track-link')
		})

		expect(result).toBe(true)
	})

	it('Should call the needRedirectAfterEvent function without callback url', () => {
		const result = trackingManager.needRedirectAfterEvent({
			callbackUrl: false,
			targetAttribute: false,
			element: document.querySelector('.track-link')
		})

		expect(result).toBe(false)
	})

	it('Should call the needRedirectAfterEvent function with an empty callback url', () => {
		const result = trackingManager.needRedirectAfterEvent({
			callbackUrl: '',
			targetAttribute: false,
			element: document.querySelector('.track-link')
		})

		expect(result).toBe(false)
	})

	it('Should call the needRedirectAfterEvent function with a callback url equal to #', () => {
		const result = trackingManager.needRedirectAfterEvent({
			callbackUrl: '#',
			targetAttribute: false,
			element: document.querySelector('.track-link')
		})

		expect(result).toBe(false)
	})

	it('Should call the needRedirectAfterEvent function with a target attribute', () => {
		const result = trackingManager.needRedirectAfterEvent({
			callbackUrl: 'http://localhost',
			targetAttribute: '_blank',
			element: document.querySelector('.track-link')
		})

		expect(result).toBe(false)
	})

	it('Should call the needRedirectAfterEvent function with an ignore attribute', () => {
		document.querySelector('.track-link').setAttribute('data-no-tracking-redirect', '')
		const result = trackingManager.needRedirectAfterEvent({
			callbackUrl: 'http://localhost',
			targetAttribute: false,
			element: document.querySelector('.track-link')
		})

		expect(result).toBe(false)
	})
})
