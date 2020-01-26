'use strict';

import TrackingManager from '../index';

let trackingManager;
const configTracking = {
	common: {
		header: {
			burgerMenu_onClick: {
				hitType: 'event',
				eventCategory: 'Header',
				eventAction: 'Click',
				eventLabel: 'Click on burger menu - {user} {isConnected}'
			}
		}
	},
	newsInfiniteScroll: {
		pageView: '{pageView}'
	}
};

const jsonEvent = {
	hitType: 'event',
	eventCategory: 'Header',
	eventAction: 'Click',
	eventLabel: 'Click on burger menu - Jest true'
};
const jsonPageView = {
	pageView: 'Home'
};

const options = {
	config: configTracking
};

const getInstance = () => new TrackingManager(options);

beforeEach(() => {
	document.body.innerHTML = `
		<a
            href="http://www.google.fr"
            target="_blank"
            class="track-link"
            data-track
            data-track-key="common.header.burgerMenu_onClick"
            data-track-params='{"{isConnected}": "true","{user}": "Jest"}'
        ></a>
        <a
            href="http://www.google.fr"
            target="_blank"
            class="track-link-without-params"
            data-track
            data-track-key="common.header.burgerMenu_onClick"
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
            data-track-key="common.header.burgerMenu_onClick"
            data-track-params='{"{isConnected}": "true","{user}": "Jest"}'
        ></button>
	`;

	Object.defineProperty(window, 'ga', {
		writable: true,
		value: () => {}
	});

	Object.defineProperty(window, 'location', {
		writable: true,
		value: {
			assign: () => {},
			href: 'http://www.google.fr'
		}
	});

	trackingManager = getInstance();
});

describe('TrackingManager function', () => {
	it('Initialize the constructor and test parameters', () => {
		expect(trackingManager.config).toMatchObject(configTracking);

		expect(trackingManager.debug).toBe(false);
	});

	it('Initialize the constructor with debug mode', () => {
		const instance = new TrackingManager({
			debug: true
		});

		expect(instance.debug).toBe(true);
	});

	it('Initialize the init function', () => {
		trackingManager.parseDOM = jest.fn();
		trackingManager.init();

		expect(trackingManager.parseDOM).toHaveBeenCalled();
	});

	it('Initialize the parseDOM function', () => {
		trackingManager.trackClickEvent = jest.fn();

		trackingManager.parseDOM();

		const elementParsed = document
			.querySelector('.track-button')
			.hasAttribute('tracking-parsed');

		document.querySelector('.track-button').click();

		expect(elementParsed).toBe(true);
		expect(trackingManager.trackClickEvent).toHaveBeenCalled();
	});

	it('Initialize the trackPageView function', () => {
		trackingManager.sendPageView = jest.fn();

		trackingManager.trackPageView('newsInfiniteScroll', 'Home');

		expect(trackingManager.sendPageView).toHaveBeenCalledWith({
			key: 'newsInfiniteScroll',
			json: jsonPageView
		});
	});

	it('Initialize the trackPageView function with unknown key', () => {
		expect(() => {
			trackingManager.trackPageView('test', 'home');
		}).toThrow(new Error('[Tracking -> trackPageView] key `test` undefined or unknown'));
	});

	it('Initialize the trackEvent function', () => {
		trackingManager.sendEvent = jest.fn();

		trackingManager.trackEvent('common.header.burgerMenu_onClick', {
			'{isConnected}': true,
			'{user}': 'Jest'
		});

		expect(trackingManager.sendEvent).toHaveBeenCalledWith({
			key: 'common.header.burgerMenu_onClick',
			json: jsonEvent,
			callbackUrl: false,
			target: false
		});
	});

	it('Initialize the trackEvent function with unknown key', () => {
		expect(() => {
			trackingManager.trackEvent('test', 'home');
		}).toThrow(new Error('[Tracking -> trackEvent] key `test` undefined or unknown'));
	});

	it('Initialize the trackClickEvent function with a button', () => {
		trackingManager.sendEvent = jest.fn();

		trackingManager.init();
		document.querySelector('.track-button').click();

		expect(trackingManager.sendEvent).toHaveBeenCalledWith({
			key: 'common.header.burgerMenu_onClick',
			json: jsonEvent,
			callbackUrl: false,
			target: false,
			element: document.querySelector('.track-button')
		});
	});

	it('Initialize the trackClickEvent function with a link', () => {
		trackingManager.sendEvent = jest.fn();

		trackingManager.init();
		document.querySelector('.track-link').click();

		expect(trackingManager.sendEvent).toHaveBeenCalledWith({
			key: 'common.header.burgerMenu_onClick',
			json: jsonEvent,
			callbackUrl: 'http://www.google.fr',
			target: '_blank',
			element: document.querySelector('.track-link')
		});
	});

	it('Initialize the trackClickEvent function with a link', () => {
		trackingManager.sendEvent = jest.fn();

		trackingManager.init();
		document.querySelector('.track-link-without-params').click();

		expect(trackingManager.sendEvent).toHaveBeenCalledWith({
			key: 'common.header.burgerMenu_onClick',
			json: configTracking.common.header.burgerMenu_onClick,
			callbackUrl: 'http://www.google.fr',
			target: '_blank',
			element: document.querySelector('.track-link-without-params')
		});
	});

	it('Initialize the trackClickEvent function with a link and trigger paveView', () => {
		trackingManager.sendPageView = jest.fn();

		trackingManager.init();
		document.querySelector('.track-page-view-link').click();

		expect(trackingManager.sendPageView).toHaveBeenCalledWith({
			key: 'newsInfiniteScroll',
			json: jsonPageView
		});
	});

	it('Initialize the loopReplace function', () => {
		const objectReference = configTracking.common.header.burgerMenu_onClick;
		const objectReplace = document
			.querySelector('.track-button')
			.getAttribute('data-track-params');
		const result = trackingManager.loopReplace(objectReference, JSON.parse(objectReplace));

		expect(result).toMatchObject(jsonEvent);
	});

	it('Initialize the loopReplace function without replace object', () => {
		const objectReference = configTracking.common.header.burgerMenu_onClick;
		const result = trackingManager.loopReplace(objectReference);

		expect(result).toMatchObject(objectReference);
	});

	it('Initialize the isGoogleAnalyticsAvailable function', () => {
		const result = trackingManager.isGoogleAnalyticsAvailable();
		expect(result).toBe(true);
	});

	it('Initialize the getConfigEventFromKey function', () => {
		const result = trackingManager.getConfigEventFromKey('common.header.burgerMenu_onClick');
		expect(result).toBe(configTracking.common.header.burgerMenu_onClick);
	});

	it('Initialize the sendPageView function', () => {
		window.ga = jest.fn();
		jest.spyOn(global.console, 'log');

		trackingManager.sendPageView({
			key: 'common.header.burgerMenu_onClick',
			json: jsonPageView
		});

		expect(window.ga).toHaveBeenCalledWith('set', 'page', 'Home');
		expect(window.ga).toHaveBeenCalledWith('send', 'pageView');
	});

	it('Initialize the sendPageView function with debug', () => {
		window.ga = jest.fn();
		jest.spyOn(global.console, 'log');

		trackingManager.debug = true;
		trackingManager.sendPageView({
			key: 'common.header.burgerMenu_onClick',
			json: jsonPageView
		});

		expect(window.ga).toHaveBeenCalledWith('set', 'page', 'Home');
		expect(window.ga).toHaveBeenCalledWith('send', 'pageView');
		expect(console.log).toBeCalledWith(
			'%c[Tracking -> trackPageView]:',
			'color: DeepPink;',
			'common.header.burgerMenu_onClick',
			jsonPageView
		);
	});

	it('Initialize the sendPageView function with isGoogleAnalyticsAvailable function called', () => {
		trackingManager.isGoogleAnalyticsAvailable = jest.fn();

		trackingManager.sendPageView({
			key: 'common.header.burgerMenu_onClick',
			json: jsonPageView
		});

		expect(trackingManager.isGoogleAnalyticsAvailable).toHaveBeenCalled();
	});

	it('Initialize the sendEvent function with debug', () => {
		window.ga = jest.fn();
		jest.spyOn(global.console, 'log');

		trackingManager.debug = true;
		trackingManager.sendEvent({
			key: 'common.header.burgerMenu_onClick',
			json: jsonEvent,
			callbackUrl: 'http://www.google.fr',
			target: '_blank',
			element: document.querySelector('.track-link')
		});

		expect(window.ga).toHaveBeenCalledWith('send', jsonEvent);
		expect(console.log).toBeCalledWith(
			'%c[Tracking -> trackEvent]:',
			'color: DeepPink;',
			'common.header.burgerMenu_onClick',
			jsonEvent,
			{
				callbackUrl: 'http://www.google.fr',
				target: '_blank',
				element: document.querySelector('.track-link')
			}
		);
	});

	it('Initialize the sendEvent function with isGoogleAnalyticsAvailable function called', () => {
		trackingManager.isGoogleAnalyticsAvailable = jest.fn();

		trackingManager.sendEvent({
			key: 'common.header.burgerMenu_onClick',
			json: jsonEvent,
			callbackUrl: 'http://www.google.fr',
			target: '_blank',
			element: document.querySelector('.track-link')
		});

		expect(trackingManager.isGoogleAnalyticsAvailable).toHaveBeenCalled();
	});

	it('Initialize the sendEvent function with no element', () => {
		window.ga = jest.fn();
		jest.spyOn(global.console, 'log');

		const callbackUrl = 'http://www.google.fr';

		trackingManager.debug = true;
		trackingManager.sendEvent({
			key: 'common.header.burgerMenu_onClick',
			json: jsonEvent,
			callbackUrl: callbackUrl,
			target: '_blank'
		});

		expect(window.ga).toHaveBeenCalledWith('send', jsonEvent);
		expect(console.log).toBeCalledWith(
			'%c[Tracking -> trackEvent]:',
			'color: DeepPink;',
			'common.header.burgerMenu_onClick',
			jsonEvent,
			{
				callbackUrl: callbackUrl,
				target: '_blank',
				element: null
			}
		);
	});

	it('Initialize the sendEvent function with hit callback', () => {
		const callbackUrl = 'http://www.google.fr';

		jsonEvent.hitCallback = () => {
			window.location.assign(callbackUrl);
		};
		trackingManager.sendEvent({
			key: 'common.header.burgerMenu_onClick',
			json: jsonEvent,
			callbackUrl: callbackUrl,
			target: false,
			element: document.querySelector('.track-link')
		});
		jsonEvent.hitCallback();

		expect(window.location.href).toBe(callbackUrl);
	});
});
