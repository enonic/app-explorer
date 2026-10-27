import type {AggregationsResult} from '/lib/xp/node';


export interface JournalHit {
	name?: string
	collection: string
	duration: number
	endTime: number
	errorCount: number
	startTime: number
	successCount: number
}

export interface QueryJournalsRes {
	aggregations?: {
		collection: AggregationsResult
	}
	count: number
	end: number
	hits: JournalHit[]
	page: number
	start: number
	total: number
	totalPages: number
}
