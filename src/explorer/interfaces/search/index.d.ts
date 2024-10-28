import type {AnyObject} from '@enonic/js-utils/src/types';


export type Profiling = {
	currentTimeMillis: number
	durationMs: number
	durationSinceLocalStartMs: number
	durationSinceTotalStartMs: number
	label: string
	operation: string
}

export type Synonyms = {
	_highlight: AnyObject
	_score: number
	synonyms: {
		locale: string
		synonym: string
	}[]
	thesaurusName: string
}[]
