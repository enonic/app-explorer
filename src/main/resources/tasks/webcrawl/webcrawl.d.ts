// import type { NestedRecord } from "/lib/explorer/types";

export type HttpRequestHeader = {
	error?: string // Should only be used by the UI, not persisted to the server
	name: string
	value: string
}

// Use type instead of interface, because interface doesn't satify AnyObject
export type CollectorConfig = {
	baseUri?: string
	excludes?: string|string[]
	httpRequestHeaders?: HttpRequestHeader[]
	keepHtml?: boolean
	maxPages?: number
	userAgent?: string
}

export type RobotsTxt = {
	isAllowed: (userAgent: string, path: string) => boolean
	isDisallowAll: (userAgent: string) => boolean
	isIndexable: (userAgent: string, path: string) => boolean
}

// NOTE: Using type instead of interface, because interface doesn't satify NestedRecord
export type WebCrawlConfig = {
	baseUri?: string
	excludes?: string|string[]
	httpRequestHeaders?: HttpRequestHeader[]
	keepHtml?: boolean
	maxPages?: number
	userAgent?: string
	resume?: boolean
}

// export interface WebCrawlConfig extends CollectorConfig {
// 	resume?: boolean
// 	// [propertyKey: PropertyKey]: NestedRecord | unknown // So that it satisfies NestedRecord
// }
