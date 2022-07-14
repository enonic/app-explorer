import type {
	AnyObject,
	DocumentNode
} from '/lib/explorer/types/index.d';
import type {Highlight} from '../highlight/input/index.d';
//import type {HighlightArray} from '../highlight/output/index.d';
import type {SynonymsArray} from '/lib/explorer/synonym/index.d';


export type {EmptyObject} from '/lib/explorer/types/index.d';


export type GraphQLContext = {
	interfaceName :string
}

type AggregationsArg = Array<AnyObject> // TODO?
type FiltersArg = Array<AnyObject> // TODO?

type SearchCommonArgs = {
	aggregations ?:AggregationsArg
	filters ?:FiltersArg
	highlight ?:Highlight
	searchString :string
}

export type SearchConnectionResolverEnv = {
	args :SearchCommonArgs & {
		after ?:string
		first ?:number
	}
	context :GraphQLContext
}

export type SearchResolverEnv = {
	args :SearchCommonArgs & {
		count ?:number
		start ?:number
	}
	context :GraphQLContext
}

export type Hit = {
	_collection :string
	//_collector ?:string  // from FIELD_PATH_META
	//_collectorVersion ?:string  // from FIELD_PATH_META
	_createdTime ?:string // from FIELD_PATH_META
	_documentType ?:string // from FIELD_PATH_META
	_highlight ?:Record<string,Array<string>>
	//_highlight ?:HighlightArray
	_json :DocumentNode
	_modifiedTime ?:string // from FIELD_PATH_META
	//_language ?:string // from FIELD_PATH_META
	_score :number
	//_stemmingLanguage ?:string // from FIELD_PATH_META
}

export type SearchResolverReturnType = {
	aggregationsAsJson :AnyObject
	count :number
	hits :Array<Hit>
	start :number
	synonyms :SynonymsArray
	total :number
}
