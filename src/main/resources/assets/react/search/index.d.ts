import type {AnyObject} from '@enonic/js-utils/src/types';


export type Synonyms = Array<{
	_highlight :AnyObject
	_score :number
	synonyms :Array<{
		locale :string
		synonym :string
	}>
	thesaurusName :string
}>
