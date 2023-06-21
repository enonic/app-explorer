// import type { NestedRecord } from "/lib/explorer/types";

export interface CollectorConfig {
	baseUri?: string
	excludes?: string|string[]
	keepHtml?: boolean
	maxPages?: number
	userAgent?: string
}

// NOTE: Using type instead of interface, because interface doesn't satify NestedRecord
export type WebCrawlConfig = {
	baseUri?: string
	excludes?: string|string[]
	keepHtml?: boolean
	maxPages?: number
	userAgent?: string
	resume?: boolean
}

// export interface WebCrawlConfig extends CollectorConfig {
// 	resume?: boolean
// 	// [propertyKey: PropertyKey]: NestedRecord | unknown // So that it satisfies NestedRecord
// }
