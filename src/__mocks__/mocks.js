/**
 * Mock implementation of getConfigEventFromKey function
 *
 * @param {Class} trackingManager Instance of trackingManager
 * @param {String} key Tracking configuration key
 * @param {Object} configTracking configuration datas
 */
export function mockGetConfigEventFromKey({ trackingManager, key, configTracking }) {
	trackingManager.getConfigEventFromKey = jest.fn().mockImplementation(() => {
		return key
			.split('.')
			.reduce((accumulator, currentValue) => accumulator[currentValue], configTracking);
	});
}

/**
 * Mock implementation of loopReplace function
 *
 * @param {Class} trackingManager Instance of trackingManager
 * @param {Boolean} jsonEvent Object with all replacements
 */
export function mockLoopReplace(trackingManager, jsonEvent) {
	trackingManager.loopReplace = jest.fn().mockImplementation(() => {
		return jsonEvent;
	});
}
