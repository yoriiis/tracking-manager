declare global {
	interface Window {
		ga: (command: string, hitType: string | jsonEvent, parameters?: string) => void
	}
}

export declare interface Config {
	[key: string]: jsonEvent
}

export declare interface jsonEvent {
	hitType: string
	eventCategory: string
	eventAction: string
	eventLabel: string
	hitCallback: () => void
}

export declare interface DataTrackParams {
	[key: string]: string | boolean
}

export declare interface GaOptions {
	[key: string]: string | boolean | (() => void)
}
