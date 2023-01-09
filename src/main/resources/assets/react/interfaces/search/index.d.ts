import type {AnyObject} from '@enonic/js-utils/src/types';


export type Profiling = {
	currentTimeMillis :number
	durationMs :number
	durationSinceLocalStartMs :number
	durationSinceTotalStartMs :number
	label :string
	operation :string
}

export type Synonyms = Array<{
	_highlight :AnyObject
	_score :number
	synonyms :Array<{
		locale :string
		synonym :string
	}>
	thesaurusName :string
}>
