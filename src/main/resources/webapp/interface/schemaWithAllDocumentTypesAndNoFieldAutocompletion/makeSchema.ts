import type {AnyObject} from '/lib/explorer/types/index.d';
import type {Highlight} from '../highlight/input/index.d';
import type {Hit} from './searchResolver';


//@ts-ignore
import {newCache} from '/lib/cache';
import {
	Json as GraphQLJson,
	GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	newSchemaGenerator,
	nonNull,
	list
	//@ts-ignore
} from '/lib/graphql';
import {constructGlue} from '../utils/Glue';
import {addAggregationInput} from '../aggregations/guillotine/input/addAggregationInput';
import {addFilterInput} from '../filters/guillotine/input/addFilterInput';
import {addInputTypeHighlight} from '../highlight/input/addInputTypeHighlight';
import {searchResolver} from './searchResolver';


const SECONDS_TO_CACHE = 10;

const schemaCache = newCache({
	size: 1,
	expire: SECONDS_TO_CACHE
});

const schemaGenerator = newSchemaGenerator();


export function makeSchema() {
	return schemaCache.get('static-key', () => {
		//log.debug('caching a new schema for %s seconds', SECONDS_TO_CACHE);

		const glue = constructGlue({schemaGenerator});

		glue.addQueryField<{
			args :{ // Typescript input types
				aggregations ?:Array<AnyObject> // TODO?
				count ?:number
				filters ?:Array<AnyObject> // TODO?
				highlight ?:Highlight
				searchString :string
				start ?:number
			},
			context: {
				interfaceName :string
			}
		}, { // Typescript return types
			count :number
			hits :Array<Hit>
			total :number
		}>({
			args: { // GraphQL input types
				aggregations: list(addAggregationInput({glue})),
				count: GraphQLInt,
				filters: list(addFilterInput({glue})),
				highlight: addInputTypeHighlight({glue}),
				searchString: GraphQLString,
				start: GraphQLInt
			},
			name: 'search',
			resolve: (env) => searchResolver(env),
			type: glue.addObjectType({
				name: 'SearchResult',
				fields: {
					aggregationsAsJson: { type: GraphQLJson },
					count: { type: nonNull(GraphQLInt) },
					hits: { type: list(glue.addObjectType({
						name: 'SearchResultHit',
						fields: {
							_collection: { type: nonNull(GraphQLString) },
							_createdTime: { type: GraphQLString },
							_documentType: { type: GraphQLString },
							_json: { type: nonNull(GraphQLJson) },
							_highlight: { type: list(glue.addObjectType({
								name: 'SearchResultHitHighlight',
								fields: {
									fieldPath: { type: GraphQLString },
									highlights: { type: list(GraphQLString) }
								}
							}))},
							_modifiedTime: { type: GraphQLString },
							_score: { type: nonNull(GraphQLFloat) }
						}}))
					},
					total: { type: nonNull(GraphQLInt) }
				}
			})
		}); // addQueryField search

		return glue.buildSchema();
	}); // schemaCache.get
} // makeSchema
