import {
	GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';


export function generateSynonymTypes({
	GQL_TYPE_ID,
	//GQL_TYPE_NAME,
	GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH,
	schemaGenerator
}) {
	const {
		createObjectType
	} = schemaGenerator;
	const GQL_TYPE_FROM = list(GraphQLString);
	const GQL_TYPE_TO = list(GraphQLString);
	const GQL_TYPE_SYNONYM = createObjectType({
		name: 'Synonym',
		fields: {
			//_highlight: { type: } // TODO
			_id: { type: GQL_TYPE_ID },
			//id: { type: GraphQLString }, // NOTE Removed backwards compatibility
			//_name: { type: GQL_TYPE_NAME }, // Name is random and useless...
			_nodeType: { type: GQL_TYPE_NODE_TYPE }, // Could use enum
			_path: { type: GQL_TYPE_PATH },
			_score: { type: GraphQLFloat }, // NOTE: Only when quering
			//displayName: { type: nonNull(GraphQLString) }, // TODO We want to remove displayName
			from: { type: GQL_TYPE_FROM },
			//name: { type: GQL_TYPE_NAME }, // NOTE Removed backwards compatibility
			//score: { type: GraphQLFloat }, // NOTE: Removed backwards compatibility
			thesaurus: { type: nonNull(GraphQLString) }, // NOTE: Added from path by forceTypeSynonym
			thesaurusReference: { type: GQL_TYPE_ID },
			to: { type: GQL_TYPE_TO }//,
			//type: { type: GQL_TYPE_NODE_TYPE } // NOTE Removed backwards compatibility
		}
	});
	return {
		GQL_TYPE_FROM,
		GQL_TYPE_TO,
		GQL_TYPE_SYNONYM,
		GQL_TYPE_OBJECT_SYNONYMS_QUERY: createObjectType({
			name: 'SynonymsQuery',
			//description:
			fields: {
				total: { type: nonNull(GraphQLInt) },
				count: { type: nonNull(GraphQLInt) },
				hits: { type: list(GQL_TYPE_SYNONYM) }
			} // fields
		})
	};
}
