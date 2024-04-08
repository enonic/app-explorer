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

export interface WebCrawlDocument {
	// Required
	domain: string
	path: string
	url: string
	// Optional
	_id?: string // Will be added if previous document is found
	displayname?: string
	links?: string[]
	og_description?: string
	og_locale?: string
	og_site_name?: string
	og_title?: string
	html?: string
	text?: string
	title?: string
}
