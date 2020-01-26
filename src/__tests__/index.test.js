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
				eventLabel: 'Click on burger menu {isConnected}'
			}
		}
	},
	newsInfiniteScroll: {
		pageView: '{pageView}'
	}
};

const options = {
	config: configTracking
};

const getInstance = () => new TrackingManager(options);

beforeEach(() => {
	document.body.innerHTML = `
		<a href="http://www.google.fr" target="_blank" class="track-link" data-track data-track-key="common.header.burgerMenu_onClick" data-track-params='{"{isConnected}": "true"}'></a>
		<button class="track-button" data-track data-track-key="common.header.burgerMenu_onClick" data-track-params='{"{isConnected}": "true"}'></button>
	`;
	trackingManager = getInstance();
});

describe('TrackingManager function', () => {
	it('Initialize the constructor and test parameters', () => {
		expect(trackingManager.config).toMatchObject({
			common: {
				header: {
					burgerMenu_onClick: {
						hitType: 'event',
						eventCategory: 'Header',
						eventAction: 'Click',
						eventLabel: 'Click on burger menu {isConnected}'
					}
				}
			}
		});

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

		trackingManager.trackPageView('newsInfiniteScroll', 'home');

		expect(trackingManager.sendPageView).toHaveBeenCalledWith({
			key: 'newsInfiniteScroll',
			json: {
				pageView: 'home'
			}
		});
	});

	it('Initialize the trackEvent function', () => {
		trackingManager.sendEvent = jest.fn();

		trackingManager.trackEvent('common.header.burgerMenu_onClick', {
			'{isConnected}': true
		});

		expect(trackingManager.sendEvent).toHaveBeenCalledWith({
			key: 'common.header.burgerMenu_onClick',
			json: {
				hitType: 'event',
				eventCategory: 'Header',
				eventAction: 'Click',
				eventLabel: 'Click on burger menu true'
			},
			callbackUrl: false,
			target: false
		});
	});

	it('Initialize the trackClickEvent function with a button', () => {
		trackingManager.sendEvent = jest.fn();

		trackingManager.init();
		document.querySelector('.track-button').click();

		expect(trackingManager.sendEvent).toHaveBeenCalledWith({
			key: 'common.header.burgerMenu_onClick',
			json: {
				hitType: 'event',
				eventCategory: 'Header',
				eventAction: 'Click',
				eventLabel: 'Click on burger menu true'
			},
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
			json: {
				hitType: 'event',
				eventCategory: 'Header',
				eventAction: 'Click',
				eventLabel: 'Click on burger menu true'
			},
			callbackUrl: 'http://www.google.fr',
			target: '_blank',
			element: document.querySelector('.track-link')
		});
	});
});
