/**
 * Mock implementation of getConfigEventFromKey function
 *
 * @param {Class} trackingManager Instance of trackingManager
 * @param {Boolean} status Status of the return of the function
 */
export function mockGetConfigEventFromKey (trackingManager, key) {
	trackingManager.getConfigEventFromKey = jest.fn().mockImplementation(() => {
		return key
			.split('.')
			.reduce(
				(accumulator, currentValue) => accumulator[currentValue],
				trackingManager.config
			);
	});
}

/**
 * Mock implementation of loopReplace function
 *
 * @param {Class} trackingManager Instance of trackingManager
 * @param {Boolean} jsonEvent Object with all replacements
 */
export function mockLoopReplace (trackingManager, jsonEvent) {
	trackingManager.loopReplace = jest.fn().mockImplementation(() => {
		return jsonEvent;
	});
}

/**
 * Mock implementation of isGoogleAnalyticsAvailable function
 *
 * @param {Class} trackingManager Instance of trackingManager
 * @param {Boolean} status Status of the return of the function
 */
export function mockIsGoogleAnalyticsAvailable (trackingManager, status) {
	trackingManager.isGoogleAnalyticsAvailable = jest.fn().mockImplementation(() => {
		return status;
	});
}
