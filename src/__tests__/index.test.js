'use strict';

import TrackingManager from '../index';
import {
	mockGetConfigEventFromKey,
	mockLoopReplace,
	mockIsGoogleAnalyticsAvailable
} from '../__mocks__/mocks';

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
			href: 'http://localhost/'
		}
	});

	trackingManager = getInstance();
});

describe('TrackingManager constructor', () => {
	it('Should initialize the constructor', () => {
		expect(trackingManager.config).toMatchObject(configTracking);
		expect(trackingManager.debug).toBe(false);
		expect(trackingManager.selector).toBe('[data-track]');
		expect(trackingManager.ignoreRedirectAttribute).toBe('data-no-tracking-redirect');
	});

	it('Should initialize the constructor with debug mode', () => {
		const instance = new TrackingManager({
			debug: true
		});

		expect(instance.debug).toBe(true);
	});
});

describe('TrackingManager init', () => {
	it('Should call the init function', () => {
		trackingManager.parseDOM = jest.fn();

		trackingManager.init();

		expect(trackingManager.parseDOM).toHaveBeenCalled();
	});
});

describe('TrackingManager parseDOM', () => {
	it('Initialize the parseDOM function', () => {
		const element = document.querySelector('.track-button');

		element.addEventListener = jest.fn();

		trackingManager.parseDOM();

		expect(element.hasAttribute('tracking-parsed')).toBe(true);
		expect(element.addEventListener).toHaveBeenCalled();
	});
});

describe('TrackingManager trackPageView', () => {
	it('Should call the trackPageView function', () => {
		const key = 'newsInfiniteScroll';

		mockGetConfigEventFromKey(trackingManager, key);
		trackingManager.sendPageView = jest.fn();

		trackingManager.trackPageView(key, 'Home');

		expect(trackingManager.getConfigEventFromKey).toHaveBeenCalledWith(key);
		expect(trackingManager.sendPageView).toHaveBeenCalledWith({
			key: 'newsInfiniteScroll',
			json: jsonPageView
		});
	});

	it('Should call the trackPageView function with unknown key', () => {
		const key = 'test';

		mockGetConfigEventFromKey(trackingManager, key);

		expect(() => {
			trackingManager.trackPageView(key, 'home');
		}).toThrow(new Error('[Tracking -> trackPageView] key `test` undefined or unknown'));
	});
});

describe('TrackingManager trackEvent', () => {
	it('Should call the trackEvent function', () => {
		const key = 'common.header.burgerMenu_onClick';

		mockGetConfigEventFromKey(trackingManager, key);
		trackingManager.sendEvent = jest.fn();

		trackingManager.trackEvent(key, {
			'{isConnected}': true,
			'{user}': 'Jest'
		});

		expect(trackingManager.getConfigEventFromKey).toHaveBeenCalledWith(key);
		expect(trackingManager.sendEvent).toHaveBeenCalledWith({
			key,
			json: jsonEvent,
			callbackUrl: false,
			target: false
		});
	});

	it('Should call the trackEvent function with unknown key', () => {
		const key = 'test';

		mockGetConfigEventFromKey(trackingManager, key);

		expect(() => {
			trackingManager.trackEvent(key, 'home');
		}).toThrow(new Error('[Tracking -> trackEvent] key `test` undefined or unknown'));
	});
});

describe('TrackingManager trackClickEvent', () => {
	it('Should call the trackClickEvent function with a button', () => {
		const key = 'common.header.burgerMenu_onClick';
		const element = document.querySelector('.track-button');

		mockGetConfigEventFromKey(trackingManager, key);
		mockLoopReplace(trackingManager, jsonEvent);
		trackingManager.sendEvent = jest.fn();

		trackingManager.trackClickEvent({
			preventDefault: () => {},
			currentTarget: element
		});

		expect(trackingManager.getConfigEventFromKey).toHaveBeenCalledWith(key);
		expect(trackingManager.loopReplace).toHaveBeenCalled();
		expect(trackingManager.sendEvent).toHaveBeenCalledWith({
			key,
			json: jsonEvent,
			callbackUrl: false,
			target: false,
			element
		});
	});

	it('Should call the trackClickEvent function with a link', () => {
		const key = 'common.header.burgerMenu_onClick';
		const element = document.querySelector('.track-link');

		mockGetConfigEventFromKey(trackingManager, key);
		mockLoopReplace(trackingManager, jsonEvent);
		trackingManager.sendEvent = jest.fn();

		trackingManager.trackClickEvent({
			preventDefault: () => {},
			currentTarget: element
		});

		expect(trackingManager.getConfigEventFromKey).toHaveBeenCalledWith(key);
		expect(trackingManager.sendEvent).toHaveBeenCalledWith({
			key,
			json: jsonEvent,
			callbackUrl: 'http://www.google.fr',
			target: '_blank',
			element
		});
	});

	it('Should call the trackClickEvent function with a link with parameters', () => {
		const key = 'common.header.burgerMenu_onClick';
		const element = document.querySelector('.track-link-without-params');

		mockGetConfigEventFromKey(trackingManager, key);
		mockLoopReplace(trackingManager, jsonEvent);
		trackingManager.sendEvent = jest.fn();

		trackingManager.trackClickEvent({
			preventDefault: () => {},
			currentTarget: element
		});

		expect(trackingManager.sendEvent).toHaveBeenCalledWith({
			key,
			json: configTracking.common.header.burgerMenu_onClick,
			callbackUrl: 'http://www.google.fr',
			target: '_blank',
			element
		});
	});

	it('Initialize the trackClickEvent function with a link and trigger paveView', () => {
		const key = 'newsInfiniteScroll';
		const element = document.querySelector('.track-page-view-link');

		mockGetConfigEventFromKey(trackingManager, key);
		mockLoopReplace(trackingManager, jsonEvent);
		trackingManager.sendPageView = jest.fn();

		trackingManager.trackClickEvent({
			preventDefault: () => {},
			currentTarget: element
		});

		expect(trackingManager.sendPageView).toHaveBeenCalledWith({
			key,
			json: jsonPageView
		});
	});
});

describe('TrackingManager loopReplace', () => {
	it('Should call the loopReplace function', () => {
		const objectReference = configTracking.common.header.burgerMenu_onClick;
		const objectReplace = document
			.querySelector('.track-button')
			.getAttribute('data-track-params');
		const result = trackingManager.loopReplace(objectReference, JSON.parse(objectReplace));

		expect(result).toMatchObject(jsonEvent);
	});

	it('Should call the loopReplace function without replace object', () => {
		const objectReference = configTracking.common.header.burgerMenu_onClick;
		const result = trackingManager.loopReplace(objectReference);

		expect(result).toMatchObject(objectReference);
	});
});

describe('TrackingManager sendEvent', () => {
	it('Initialize the sendEvent function with debug', () => {
		const key = 'common.header.burgerMenu_onClick';
		const callbackUrl = 'http://www.google.fr';

		window.ga = jest.fn();
		console.log = jest.fn();
		mockIsGoogleAnalyticsAvailable(trackingManager, true);

		trackingManager.debug = true;
		trackingManager.sendEvent({
			key,
			json: jsonEvent,
			callbackUrl: callbackUrl,
			target: '_blank',
			element: document.querySelector('.track-link')
		});

		expect(console.log).toBeCalledWith(
			'%c[Tracking -> trackEvent]:',
			'color: DeepPink;',
			key,
			jsonEvent,
			{
				callbackUrl: callbackUrl,
				target: '_blank',
				element: document.querySelector('.track-link')
			}
		);
		expect(trackingManager.isGoogleAnalyticsAvailable).toHaveBeenCalled();
		expect(window.ga).toHaveBeenCalledWith('send', jsonEvent);
	});

	it('Initialize the sendEvent function with hit callback', () => {
		const callbackUrl = 'http://localhost/';
		jsonEvent.hitCallback = () => {
			window.location.assign(callbackUrl);
		};

		window.ga = jest.fn();
		window.location.assign = jest.fn();
		console.log = jest.fn();
		mockIsGoogleAnalyticsAvailable(trackingManager, true);

		trackingManager.sendEvent({
			key: 'common.header.burgerMenu_onClick',
			json: jsonEvent,
			callbackUrl: false,
			target: false,
			element: document.querySelector('.track-link')
		});
		jsonEvent.hitCallback();

		expect(window.location.assign).toHaveBeenCalledWith(callbackUrl);
	});
});

describe('TrackingManager sendPageView', () => {
	it('Should call the sendPageView function', () => {
		window.ga = jest.fn();
		console.log = jest.fn();
		mockIsGoogleAnalyticsAvailable(trackingManager, true);

		trackingManager.sendPageView({
			key: 'common.header.burgerMenu_onClick',
			json: jsonPageView
		});

		expect(trackingManager.isGoogleAnalyticsAvailable).toHaveBeenCalled();
		expect(window.ga).toHaveBeenCalledWith('set', 'page', 'Home');
		expect(window.ga).toHaveBeenCalledWith('send', 'pageView');
	});

	it('Should call the sendPageView function with debug', () => {
		window.ga = jest.fn();
		console.log = jest.fn();
		mockIsGoogleAnalyticsAvailable(trackingManager, true);

		trackingManager.debug = true;
		trackingManager.sendPageView({
			key: 'common.header.burgerMenu_onClick',
			json: jsonPageView
		});

		expect(console.log).toBeCalledWith(
			'%c[Tracking -> trackPageView]:',
			'color: DeepPink;',
			'common.header.burgerMenu_onClick',
			jsonPageView
		);
	});

	it('Should call the sendPageView function with GA not available', () => {
		window.ga = jest.fn();
		mockIsGoogleAnalyticsAvailable(trackingManager, false);

		trackingManager.sendPageView({
			key: 'common.header.burgerMenu_onClick',
			json: jsonPageView
		});

		expect(trackingManager.isGoogleAnalyticsAvailable).toHaveBeenCalled();
		expect(window.ga).not.toHaveBeenCalledWith('set', 'page', 'Home');
	});
});

describe('TrackingManager isGoogleAnalyticsAvailable', () => {
	it('Should call the isGoogleAnalyticsAvailable function with GA available', () => {
		expect(trackingManager.isGoogleAnalyticsAvailable()).toBe(true);
	});

	it('Should call the isGoogleAnalyticsAvailable function with GA not available', () => {
		window.ga = undefined;

		expect(trackingManager.isGoogleAnalyticsAvailable()).toBe(false);
	});
});

describe('TrackingManager getConfigEventFromKey', () => {
	it('Should call the getConfigEventFromKey function', () => {
		const result = trackingManager.getConfigEventFromKey('common.header.burgerMenu_onClick');

		expect(result).toBe(configTracking.common.header.burgerMenu_onClick);
	});
});
