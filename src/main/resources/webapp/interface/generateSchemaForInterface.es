import {
	QUERY_OPERATOR_AND,
	//VALUE_TYPE_ANY,
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_REFERENCE,
	//VALUE_TYPE_SET,
	VALUE_TYPE_STRING,
	addQueryFilter,
	camelize,
	forceArray,
	fulltext,
	//group,
	or,
	isBoolean,
	isDateString,
	isNumber,
	isObject,
	isSet,
	isString,
	ngram,
	toStr,
	stemmed,
	ucFirst
} from '@enonic/js-utils';
import {v4 as isUuid4} from 'is-uuid';

import {getFields} from '/lib/explorer/field/getFields';
import {get as getInterface} from '/lib/explorer/interface/get';
import {filter as filterInterface} from '/lib/explorer/interface/filter';
import {hasValue} from '/lib/explorer/query/hasValue';
import {
	COLLECTION_REPO_PREFIX,
	NT_DOCUMENT,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {removeStopWords} from '/lib/explorer/query/removeStopWords';
import {wash} from '/lib/explorer/query/wash';
import {connect} from '/lib/explorer/repo/connect';
import {multiConnect} from '/lib/explorer/repo/multiConnect';
import {get as getStopWordsList} from '/lib/explorer/stopWords/get';
import {
	GraphQLBoolean,
	//GraphQLDouble, // There is no such type
	GraphQLFloat,
	GraphQLID,
	GraphQLInt,
	GraphQLString,
	Json as GraphQLJson,
	list,
	newSchemaGenerator,
	nonNull,
	reference
} from '/lib/graphql';
import {
	//createConnectionType,
	decodeCursor,
	encodeCursor
} from '/lib/graphql-connection';


//import {schemaGenerator} from './schemaGenerator';

import {generateEnumTypes} from './enumTypes';
/*import {
	GRAPHQL_ENUM_TYPE_AGGREGATION_GEO_DISTANCE_UNIT,
	GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ENCODER,
	GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_FRAGMENTER,
	GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ORDER,
	GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_TAG_SCHEMA
} from './enumTypes';*/

import {generateInputTypes} from './inputTypes';
/*import {
	GRAPHQL_INPUT_TYPE_FILTER_IDS
} from './inputTypes';*/

import {generateTypes} from './types';
//import {OBJECT_TYPE_AGGREGATIONS_UNION} from './types';

import {valueTypeToGraphQLType} from './valueTypeToGraphQLType';
import {aggregationQueryTypeToGraphQLType} from './aggregationQueryTypeToGraphQLType';
import {washDocumentNode} from './washDocumentNode';

const schemaGenerator = newSchemaGenerator();
const {
	createEnumType,
	createInputObjectType,
	createObjectType,
	createUnionType,
	createSchema
} = schemaGenerator;
//import {DEFAULT_INTERFACE_FIELDS} from '../constants';

//log.debug(`Number.MIN_SAFE_INTEGER:${Number.MIN_SAFE_INTEGER} Number.MAX_SAFE_INTEGER:${Number.MAX_SAFE_INTEGER}`); // Undefined
//log.debug(`Number.MIN_VALUE:${Number.MIN_VALUE} Number.MAX_VALUE:${Number.MAX_VALUE}`); // Number.MIN_VALUE:5e-324 Number.MAX_VALUE:1.7976931348623157e+308
const JAVA_MIN_SAFE_INT = -2147483648;
const JAVA_MAX_SAFE_INT =  2147483647;

const VALUE_TYPE_VARIANTS = [
	//VALUE_TYPE_ANY,
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_REFERENCE,
	//VALUE_TYPE_SET,
	VALUE_TYPE_STRING
];

const {
	GRAPHQL_ENUM_TYPE_AGGREGATION_GEO_DISTANCE_UNIT,
	GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ENCODER,
	GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_FRAGMENTER,
	GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ORDER,
	GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_TAG_SCHEMA
} = generateEnumTypes(schemaGenerator);

const {
	GRAPHQL_INPUT_TYPE_FILTER_IDS
} = generateInputTypes(schemaGenerator);

const {OBJECT_TYPE_AGGREGATIONS_UNION} = generateTypes(schemaGenerator);

const INPUT_OBJECT_TYPE_SUB_AGGREGATIONS_NAME = 'InputObjectTypeSubAggregations';


export function generateSchemaForInterface(interfaceName) {
	const explorerRepoReadConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });

	//──────────────────────────────────────────────────────────────────────────
	// In order to make a documentTypesUnion supporting GraphQL inline fragments (... on documentType)
	// I have to make one objectType per documentType and it needs a unqiue name
	// It needs all global fields, and all documentType local fields
	//──────────────────────────────────────────────────────────────────────────
	// 1. Get all global fields, and make a spreadable fields object to reuse and override per docmentType
	//──────────────────────────────────────────────────────────────────────────
	const fieldsRes = getFields({
		connection: explorerRepoReadConnection,
		includeSystemFields: true
	});
	//log.debug(`fieldsRes:${toStr(fieldsRes)}`);
	//log.debug(`fieldsRes.hits[0]:${toStr(fieldsRes.hits[0])}`);
	const camelToFieldObj = {};
	const spreadableGlobalFieldsObj = {};
	fieldsRes.hits.forEach(({ // TODO traverse
		fieldType: valueType,
		inResults,
		//isSystemField = false,
		key//,
		//max, // TODO nonNull list
		//min
	}) => {
		if (valueType) {
			const camelizedFieldKey = camelize(key, /[.-]/g);
			camelToFieldObj[camelizedFieldKey] = key;
			if (inResults !== false) {
				spreadableGlobalFieldsObj[camelizedFieldKey] = {
					type: valueTypeToGraphQLType(valueType) // TODO min and max?
				};
			}
		}
	});
	//log.debug(`spreadableGlobalFieldsObj:${toStr(spreadableGlobalFieldsObj)}`);

	//──────────────────────────────────────────────────────────────────────────
	// 2. Get all documentTypes mentioned in the interface collections
	//──────────────────────────────────────────────────────────────────────────
	const interfaceNode = getInterface({
		connection: explorerRepoReadConnection,
		interfaceName
	});
	//log.debug(`interfaceNode:${toStr(interfaceNode)}`);

	const {
		collectionIds,
		fields = [],// = DEFAULT_INTERFACE_FIELDS, TODO This wont work when fields = [] which filter does
		stopWords//,
		//synonyms // TODO
	} = filterInterface(interfaceNode);
	//log.debug(`fields:${toStr(fields)}`);
	//log.debug(`stopWords:${toStr(stopWords)}`);
	//log.debug(`synonyms:${toStr(synonyms)}`);

	//log.debug(`collectionIds:${toStr(collectionIds)}`);

	const collections = explorerRepoReadConnection.get(collectionIds);
	//log.debug(`collections:${toStr(collections)}`);

	const collectionIdToDocumentTypeId = {};
	const documentTypeIds = collections.map(({
		_id: collectionId,
		documentTypeId
	}) => {
		if (isSet(documentTypeId)) {
			collectionIdToDocumentTypeId[collectionId] = documentTypeId;
		}
		return documentTypeId;
	})
		.filter((v, i, a) => isSet(v) && a.indexOf(v) === i);
	//log.debug(`documentTypeIds:${toStr(documentTypeIds)}`);

	const documentTypes = explorerRepoReadConnection.get(documentTypeIds);
	//log.debug(`documentTypes:${toStr(documentTypes)}`);

	//──────────────────────────────────────────────────────────────────────────
	// 3. Make one objectType per documentType
	//──────────────────────────────────────────────────────────────────────────
	function documentTypeNameToGraphQLObjectTypeName(documentTypeName) {
		return `DocumentType_${documentTypeName}`;
	}

	const documentTypeObjectTypes = {};
	documentTypes.forEach(({
		_name: documentTypeName,
		properties
	}) => {
		const spreadableLocalFieldsObj = {};
		if (properties) {
			forceArray(properties).forEach(({ name, valueType }) => {
				const camelizedFieldKey = camelize(name, /[.-]/g);
				if (camelToFieldObj[camelizedFieldKey] && camelToFieldObj[camelizedFieldKey] !== name) {
					throw new Error(`Name collision from camelized:${camelizedFieldKey} to both ${camelToFieldObj[camelizedFieldKey]} and ${name}`);
				}
				camelToFieldObj[camelizedFieldKey] = name;
				spreadableLocalFieldsObj[camelizedFieldKey] = {
					type: valueTypeToGraphQLType(valueType) // TODO min max?
				};
			});
		}
		documentTypeObjectTypes[documentTypeName] = createObjectType({
			name: documentTypeNameToGraphQLObjectTypeName(documentTypeName),
			fields: {
				...spreadableGlobalFieldsObj,
				...spreadableLocalFieldsObj
			}
		});
	}); // documentTypes.forEach
	//log.debug(`documentTypeObjectTypes:${toStr(documentTypeObjectTypes)}`);

	//──────────────────────────────────────────────────────────────────────────

	const allFieldKeys = [];

	const documentTypeIdToName = {};
	documentTypes.forEach(({
		_id: documentTypeId,
		_name: documentTypeName,
		properties
	}) => {
		documentTypeIdToName[documentTypeId] = documentTypeName;
		if (properties) {
			forceArray(properties).forEach(({name}) => {
				if (!allFieldKeys.includes(name)) {
					allFieldKeys.push(name);
				}
			});
		}
	});
	//log.debug(`allFieldKeys:${toStr(allFieldKeys)}`);



	fieldsRes.hits.forEach(({key}) => {
		if (!allFieldKeys.includes(key)) {
			allFieldKeys.push(key);
		}
	});
	allFieldKeys.sort();
	//log.debug(`allFieldKeys:${toStr(allFieldKeys)}`);

	const fieldKeysForAggregations = [];
	const fieldKeysForFilters = [];
	const highlightParameterPropertiesFields = {};
	const interfaceSearchHitsFieldsFromSchema = {};
	const interfaceSearchHitsHighlightsFields = {};
	allFieldKeys.forEach((fieldKey) => {
		const camelizedFieldKey = camelize(fieldKey, /[.-]/g);
		fieldKeysForAggregations.push(camelizedFieldKey);
		fieldKeysForFilters.push(camelizedFieldKey);
		highlightParameterPropertiesFields[camelizedFieldKey] = { type: createInputObjectType({
			name: `HighlightParameterProperties${ucFirst(camelizedFieldKey)}`,
			fields: {
				fragmenter: { type: GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_FRAGMENTER },
				fragmentSize: { type: GraphQLInt },
				noMatchSize: { type: GraphQLInt },
				numberOfFragments: { type: GraphQLInt },
				order: { type: GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ORDER },
				postTag: { type: GraphQLString },
				preTag: { type: GraphQLString },
				requireFieldMatch: { type: GraphQLBoolean }
			}
		})};
		VALUE_TYPE_VARIANTS.forEach((vT) => {
			interfaceSearchHitsFieldsFromSchema[
				`${camelizedFieldKey}_as_${vT}`
			] = { type: valueTypeToGraphQLType(vT) };
		});
		const type = valueTypeToGraphQLType(VALUE_TYPE_STRING); // TODO There may be several valueTypes...
		interfaceSearchHitsHighlightsFields[camelizedFieldKey] = { type: list(type) };
	});

	//log.debug(`fieldsRes.hits:${toStr(fieldsRes.hits)}`);
	/*fieldsRes.hits.forEach(({
		fieldType: valueType,
		inResults,
		//isSystemField = false,
		key/*,
		max, // TODO nonNull list
		min
	}) => {
		if (valueType) {
			const camelizedFieldKey = camelize(key, /[.-]/g);
			camelToFieldObj[camelizedFieldKey] = key;
			//log.debug(`key:${toStr(key)} camelized:${toStr(camelizedFieldKey)}`);
			/*if (![VALUE_TYPE_ANY, VALUE_TYPE_SET].includes(valueType)) {
				//fieldKeysForAggregations.push(camelizedFieldKey);
				//fieldKeysForFilters.push(camelizedFieldKey);
			}
			//log.debug(`key:${toStr(key)} camelized:${toStr(camelizedFieldKey)} inResults:${toStr(inResults)}`);
			if (inResults !== false) {
				/*highlightParameterPropertiesFields[camelizedFieldKey] = { type: createInputObjectType({
					name: `HighlightParameterProperties${ucFirst(camelizedFieldKey)}`,
					fields: {
						fragmenter: { type: GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_FRAGMENTER },
						fragmentSize: { type: GraphQLInt },
						noMatchSize: { type: GraphQLInt },
						numberOfFragments: { type: GraphQLInt },
						order: { type: GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ORDER },
						postTag: { type: GraphQLString },
						preTag: { type: GraphQLString },
						requireFieldMatch: { type: GraphQLBoolean }
					}
				})};

				//interfaceSearchHitsFieldsFromSchema[camelizedFieldKey] = { type };
				/*VALUE_TYPE_VARIANTS.forEach((vT) => {
					interfaceSearchHitsFieldsFromSchema[
						`${camelizedFieldKey}_as_${vT}`
					] = { type: valueTypeToGraphQLType(vT) };
				});

				const type = valueTypeToGraphQLType(valueType);
				interfaceSearchHitsHighlightsFields[camelizedFieldKey] = { type: list(type) };
			}
		}
	}); // fields.forEach*/
	//log.debug(`camelToFieldObj:${toStr(camelToFieldObj)}`);

	// Name must be non-null, non-empty and match [_A-Za-z][_0-9A-Za-z]* - was 'GraphQLScalarType{name='String', description='Built-in String', coercing=graphql.Scalars$3@af372a4}'
	//enumFieldsValues.push(GraphQLString);

	//log.debug(`enumFieldsValues:${toStr(enumFieldsValues)}`);
	//log.debug(`highlightParameterPropertiesFields:${toStr(highlightParameterPropertiesFields)}`);

	const enumFieldsKeysForAggreations = createEnumType({
		name: 'enumFieldsKeysForAggreations',
		values: fieldKeysForAggregations
	});
	const enumFieldsKeysForFilters = createEnumType({
		name: 'enumFieldsKeysForFilters',
		values: fieldKeysForFilters
	});

	//──────────────────────────────────────────────────────────────────────────
	// Filters
	//──────────────────────────────────────────────────────────────────────────
	const graphqlInputTypeFilterExistsWithDynamicFields = createInputObjectType({
		name: 'InputTypeFilterExistsWithDynamicFields',
		fields: {
			field: {
				type: nonNull(enumFieldsKeysForFilters)
			}
		}
	});

	const graphqlInputTypeFilterHasValueWithDynamicFields = createInputObjectType({
		name: 'InputTypeFilterHasValueWithDynamicFields',
		fields: {
			field: { type: nonNull(enumFieldsKeysForFilters) },
			values: { type: nonNull(list(GraphQLString)) }
		}
	});

	const graphqlInputTypeFilterNotExistsWithDynamicFields = createInputObjectType({
		name: 'InputTypeFilterNotExistsWithDynamicFields',
		fields: {
			field: {
				type: nonNull(enumFieldsKeysForFilters)
			}
		}
	});

	const graphqlInputTypeFilterBooleanDynamicFields = {
		exists: { type: graphqlInputTypeFilterExistsWithDynamicFields },
		hasValue: { type: graphqlInputTypeFilterHasValueWithDynamicFields },
		ids: { type: GRAPHQL_INPUT_TYPE_FILTER_IDS },
		notExists: { type: graphqlInputTypeFilterNotExistsWithDynamicFields }
	};

	const graphqlInputTypeFilterBooleanWithDynamicFields = createInputObjectType({
		name: 'InputTypeFilterBooleanWithDynamicFields',
		fields: {
			must: { type: list(createInputObjectType({
				name: 'InputTypeFilterBooleanMust',
				fields: graphqlInputTypeFilterBooleanDynamicFields
			}))},
			mustNot: { type: list(createInputObjectType({
				name: 'InputTypeFilterBooleanMustNot',
				fields: graphqlInputTypeFilterBooleanDynamicFields
			}))},
			should: { type: list(createInputObjectType({
				name: 'InputTypeFilterBooleanShould',
				fields: graphqlInputTypeFilterBooleanDynamicFields
			}))}
		}
	});

	//──────────────────────────────────────────────────────────────────────────

	const highlightProperties = createInputObjectType({
		name: 'HighlightParameterProperties',
		fields: highlightParameterPropertiesFields
	});

	const interfaceSearchHitsFields = {
		_collectionId: { type: nonNull(GraphQLID) },
		_collectionName: { type: nonNull(GraphQLString) },
		_documentTypeId: { type: nonNull(GraphQLString) },
		_documentTypeName: { type: nonNull(GraphQLString) },
		_highlight: { type: createObjectType({
			name: 'InterfaceSearchHitsHighlights',
			fields: interfaceSearchHitsHighlightsFields // This list can't be empty when createObjectType is called?
		})},
		_json: { type: GraphQLJson },
		_repoId: { type: nonNull(GraphQLString) },
		_score: { type: GraphQLFloat }
	};
	//log.debug(`Object.keys(interfaceSearchHitsFieldsFromSchema):${toStr(Object.keys(interfaceSearchHitsFieldsFromSchema))}`);
	Object.keys(interfaceSearchHitsFieldsFromSchema).forEach((k) => {
		interfaceSearchHitsFields[k] = interfaceSearchHitsFieldsFromSchema[k];
	});

	function searchResolver(env) {
		const {
			args: {
				aggregations: aggregationsArg = [],
				count = 10,
				filters = {},
				highlight = {},
				searchString = '',
				start = 0
			}
		} = env;
		//log.debug(`filters:${toStr(filters)}`);
		//log.debug(`highlight:${toStr(highlight)}`);

		//log.debug(`aggregationsArg:${toStr(aggregationsArg)}`);

		function aggregationsArgToQueryParamAndTypes(aggregationsArray = []) {
			//log.debug(`aggregationsArray:${toStr(aggregationsArray)}`);
			const aggregationsObj = {};
			const typesObj = {};
			//log.debug(`aggregationsArray:${toStr(aggregationsArray)}`);
			aggregationsArray.forEach(({
				name,
				subAggregations,
				...rest
			}) => {
				//log.debug(`rest:${toStr(rest)}`);
				/*if (isSet(aggregations[name])) {
					// TODO Throw GraphQLError
				}*/
				typesObj[name] = { type: Object.keys(rest)[0] };
				if (rest[Object.keys(rest)[0]].field) {
					// TODO Workaround related to https://github.com/enonic/app-explorer/issues/275
					rest[Object.keys(rest)[0]].field = camelToFieldObj[rest[Object.keys(rest)[0]].field];
				}
				aggregationsObj[name] = rest;
				if (subAggregations) {
					[
						aggregationsObj[name].aggregations,
						typesObj[name].types
					] = aggregationsArgToQueryParamAndTypes(
						subAggregations,
					); // recurse
				}
			});
			return [aggregationsObj, typesObj];
		}
		const [aggregations, types] = aggregationsArgToQueryParamAndTypes(aggregationsArg);
		//log.debug(`aggregations:${toStr(aggregations)}`);
		//log.debug(`types:${toStr(types)}`);

		//log.debug(`searchString:${toStr(searchString)}`);
		const washedSearchString = wash({string: searchString});
		//log.debug(`washedSearchString:${toStr({washedSearchString})}`);

		// TODO stopWords could be cached:
		const listOfStopWords = [];
		if (stopWords && stopWords.length) {
			//log.debug(`stopWords:${toStr(stopWords)}`);
			stopWords.forEach((name) => {
				const {words} = getStopWordsList({ // Not a query
					connection: explorerRepoReadConnection,
					name
				});
				//log.debug(`words:${toStr(words)}`);
				words.forEach((word) => {
					if (!listOfStopWords.includes(word)) {
						listOfStopWords.push(word);
					}
				});
			});
		}
		//log.debug(`listOfStopWords:${toStr({listOfStopWords})}`);

		const removedStopWords = [];
		const searchStringWithoutStopWords = removeStopWords({
			removedStopWords,
			stopWords: listOfStopWords,
			string: washedSearchString
		});
		//log.debug(`searchStringWithoutStopWords:${toStr({searchStringWithoutStopWords})}`);
		//log.debug(`removedStopWords:${toStr({removedStopWords})}`);

		//`fulltext('${fields.map(({name: field, boost = 1}) => `${field}${boost && boost > 1 ? `^${boost}` : ''}`)}', '${searchStringWithoutStopWords}', 'AND')`,
		const query = or(fulltext(
			fields.map(({boost, name: field}) => ({boost: (parseInt(boost)||1) + (fields.length*2), field})),
			searchStringWithoutStopWords,
			QUERY_OPERATOR_AND
		),stemmed(
			fields.map(({boost, name: field}) => ({boost: (parseInt(boost)||1) + fields.length, field})),
			searchStringWithoutStopWords,
			QUERY_OPERATOR_AND,
			//language // TODO @enonic/js-utils defaults to english, which is why it works
		),ngram(
			fields.map(({boost, name: field}) => ({boost, field})),
			searchStringWithoutStopWords,
			QUERY_OPERATOR_AND
		));
		//log.debug(`query:${toStr({query})}`);

		const queryParams = {
			aggregations,
			count,
			filters: addQueryFilter({
				filter: hasValue('_nodeType', [NT_DOCUMENT]),
				filters
			}),
			highlight,
			query,
			start
		};
		//log.debug(`queryParams:${toStr({queryParams})}`);

		const repoIdObj = {};
		const multiConnectParams = {
			principals: [PRINCIPAL_EXPLORER_READ],
			sources: collections.map(({
				_id: collectionId,
				_name: collectionName
			}) => {
				const repoId = `${COLLECTION_REPO_PREFIX}${collectionName}`;
				repoIdObj[repoId] = {
					collectionId,
					collectionName
				};
				const documentTypeId = collectionIdToDocumentTypeId[collectionId];
				if (documentTypeId) {
					repoIdObj[repoId].documentTypeId = documentTypeId;
					const documentTypeName = documentTypeIdToName[documentTypeId];
					if (documentTypeName) {
						repoIdObj[repoId].documentTypeName = documentTypeName;
					}
				} /*else {
					log.warning(`Unable to find documentTypeId for repoId:${repoId}`);
				}*/
				return {
					repoId,
					branch: 'master', // NOTE Hardcoded
					principals: [PRINCIPAL_EXPLORER_READ]
				};
			})
		};
		//log.debug(`multiConnectParams:${toStr(multiConnectParams)}`);
		//log.debug(`repoIdObj:${toStr({repoIdObj})}`);

		const multiRepoReadConnection = multiConnect(multiConnectParams);

		const queryRes = multiRepoReadConnection.query(queryParams);
		//log.debug(`queryRes:${toStr(queryRes)}`);

		function queryResAggregationsObjToArray(obj, localTypes = types) {
			//log.debug(`obj:${toStr(obj)}`);
			//log.debug(`localTypes:${toStr(localTypes)}`);
			return Object.keys(obj).map((name) => {
				//log.debug(`name:${toStr(name)}`);
				const anAggregation = obj[name];
				//log.debug(`anAggregation:${toStr(anAggregation)}`);
				const {
					//avg, TODO https://github.com/enonic/xp/issues/9003
					buckets,
					count,
					//max,
					//min,
					sum,
					value
				} = anAggregation;
				/*log.debug(`avg:${toStr(avg)}`);
				log.debug(`typeof avg:${toStr(typeof avg)}`);
				log.debug(`parseFloat(avg):${toStr(parseFloat(avg))}`);
				log.debug(`typeof parseFloat(avg):${toStr(typeof parseFloat(avg))}`);*/
				const rAggregation = {
					count,
					name,
					sum,
					type: aggregationQueryTypeToGraphQLType(localTypes[name].type)
				};
				/*if (isSet(avg) && isSet(parseFloat(avg))) {rAggregation.avg = avg;}
				if (isSet(max) && isSet(parseFloat(max))) {rAggregation.max = max;}
				if (isSet(min) && isSet(parseFloat(min))) {rAggregation.min = min;}*/
				if (buckets) {
					rAggregation.buckets = buckets.map(({
						docCount,
						from,
						key,
						to,
						...rest
					}) => {
						const rBucket = {
							docCount,
							key
						};
						if (isSet(from) || isSet(to)) {
							rAggregation.from = from;
							rAggregation.to = to;
						}
						//log.debug(`rest:${toStr(rest)}`);
						if (Object.keys(rest).length) {
							rBucket.subAggregations = queryResAggregationsObjToArray(rest, types[name].types); // Recurse
						}
						return rBucket;
					}); // map buckets
				} else {
					if (isSet(value)) {
						rAggregation.value = value;
					}
				} // if buckets
				return rAggregation;
			}); // map names
		}
		queryRes.aggregations = queryResAggregationsObjToArray(queryRes.aggregations);
		//log.debug(`queryRes.aggregations:${toStr(queryRes.aggregations)}`);

		queryRes.aggregationsAsJson = JSON.stringify(queryRes.aggregations);

		queryRes.hits = queryRes.hits.map(({
			branch,
			highlight,
			id,
			repoId,
			score
		}) => {
			//log.debug(`highlight:${toStr(highlight)}`);

			const washedNode = washDocumentNode(connect({
				branch,
				principals: [PRINCIPAL_EXPLORER_READ],
				repoId
			}).get(id));
			//log.debug(`washedNode:${toStr(washedNode)}`);

			const json = JSON.stringify(washedNode);

			// TODO Traverse...
			Object.keys(washedNode).forEach((k) => {
				VALUE_TYPE_VARIANTS.forEach((v) => {
					let value = washedNode[k];
					//java.time.OffsetDateTime
					//log.debug(`k:${k} value:${value} toStr(value):${toStr(value)} typeof value:${typeof value} Object.prototype.toString.call(value):${Object.prototype.toString.call(value)}`);
					switch (v) {
					case VALUE_TYPE_BOOLEAN:
						// WARN  n.g.execution.ExecutionStrategy - Can't serialize value (/search/hits[0]/instant_as_boolean)
						// : Expected something we can convert to 'java.time.OffsetDateTime' but was 'Boolean'.
						//value = !!value;
						if (!isBoolean(value)) {
							value = null;
						}
						break;
					case VALUE_TYPE_DOUBLE:
						if (isBoolean(value) || isDateString(value)) {
							value = null;
						} else {
							// language_as_double : Expected type 'Float' but was 'Double'
							const maybeFloat = parseFloat(value);
							if (isNaN(maybeFloat)) {
								value = null;
								//value = 0.0;
							} else {
								value = maybeFloat;
							}
						}
						break;
					case VALUE_TYPE_GEO_POINT:
						// '59.9090442,10.7423389' // Enonic always returns this
						// [59.9090442,10.7423389] // Enonic never returns this...
						if (Array.isArray(value)) {
							log.warning(`Enonic XP should never return GeoPoint as Array??? ${toStr(value)}`);
							if (value.length !== 2) {
								value = null; // Not GeoPoint
							} else { // value.length === 2
								const [lat, lon] = value;
								const parsedLat = parseFloat(lat);
								const parsedLon = parseFloat(lon);
								if (isNumber(parsedLat) && isNumber(parsedLon)) {
									value = `${parsedLat},${parsedLon}`;
								} else {
									value = null; // Not GeoPoint
								}
							}
						} else /* !Array */	if (!isString(value)) {
							value = null; // Not GeoPoint
						} else { // isString
							let [lat, lon] = value.split(',');
							const parsedLat = parseFloat(lat);
							const parsedLon = parseFloat(lon);
							if (isNumber(parsedLat) && isNumber(parsedLon)) {
								value = `${parsedLat},${parsedLon}`;
							} else {
								value = null; // Not GeoPoint
							}
						}
						break;
					case VALUE_TYPE_INSTANT:
						if (!isDateString(value)) {
							value = null;
						} else {
							//value = value // date_as_instant : Invalid RFC3339 value : '2021-12-31'. because of : 'Text '2021-12-31' could not be parsed at index 10
							//value = new Date(Date.parse(value)); // date_as_instant : Expected something we can convert to 'java.time.OffsetDateTime' but was 'Date'
							value = new Date(Date.parse(value)).toISOString();
						}
						break;
					case VALUE_TYPE_LOCAL_DATE:
						if (!isDateString(value)) {
							value = null;
						} else {
							value = new Date(Date.parse(value)).toLocaleDateString();
						}
						break;
					case VALUE_TYPE_LOCAL_DATE_TIME:
						if (!isDateString(value)) {
							value = null;
						} else {
							// Can't serialize value (instant_as_localDateTime) : null graphql.schema.CoercingSerializeException: null
							// However in Chrome console:
							//  new Date(Date.parse("2021-12-31T23:59:59Z")).toLocaleString();
							//    '01/01/2022, 00:59:59'
							//  new Date(Date.parse("2021-12-31T23:59:59Z")).toLocaleString('nb-NO' ,{ timeZone: 'UTC'});
							//    '31.12.2021, 23:59:59'
							//log.debug(`k:${k} value:${value} Date.parse(value):${Date.parse(value)} new Date(Date.parse(value)):${new Date(Date.parse(value))}`);
							//log.debug(`k:${k} new Date(Date.parse(value)).toLocaleString():${new Date(Date.parse(value)).toLocaleString()}`);
							// NOTE So the seems to be that GraphQL doesn't like what toLocaleString produces...
							//value = new Date(Date.parse(value)).toLocaleString();
							//value = new Date(Date.parse(value)); // Expected something what can convert to 'java.time.LocalDateTime' but was 'Date'
							//value = new Date(Date.parse(value)).toISOString(); // graphql.schema.CoercingSerializeException: null
							value = null; // TODO
						}
						break;
					case VALUE_TYPE_LOCAL_TIME:
						if (!isDateString(value)) {
							value = null;
						} else {
							value = new Date(Date.parse(value)).toLocaleTimeString();
						}
						break;
					case VALUE_TYPE_LONG:
						if (isBoolean(value) || isDateString(value)) {
							value = null;
						} else {
							//const maybeInt = parseInt(value, 10); // Actually returns Double  // https://github.com/enonic/xp/issues/8462
							const maybeFloat = parseFloat(value);
							if (isNaN(maybeFloat) || maybeFloat < JAVA_MIN_SAFE_INT || maybeFloat > JAVA_MAX_SAFE_INT) {
								value = null;
							} else {
								value = maybeFloat|0; // Rounding towards zero
							}
						}
						break;
					case VALUE_TYPE_REFERENCE:
						if (!isUuid4(value)) {
							value = null;
						}
						break;
					case VALUE_TYPE_STRING:
						if (!isString(value)) {
							if (Array.isArray(value)) {
								if (isString(value[0])) {
									value = value.join(',');
								} else {
									value = JSON.stringify(value);
								}
							} else if (isObject(value)) { // Includes Date
								value = JSON.stringify(value);
							} else { // Boolean, Float, Int, Reference?
								value = `${value}`; // false stayed false???
								//value = value.toString(); // false still stayed false???
								//value = '' + value;
								//log.debug(`k:${k} value:${value} toStr(value):${toStr(value)} typeof value:${typeof value} Object.prototype.toString.call(value):${Object.prototype.toString.call(value)}`);
							}
						}
						break;
					default:
						log.warning(`Unhandeled value type:${v}`);
					}
					washedNode[`${k}_as_${v}`] = value;
				});
			});

			// NOTE By doing this the frontend developer can't get the full field value and highlight in the same query.
			// TODO We might NOT want to do that...
			const obj = {};
			if (highlight) {
				Object.keys(highlight).forEach((k) => {
					//log.debug(`k:${k} highlight[${k}]:${toStr(highlight[k])}`);
					//const first = forceArray(highlight[k])[0];
					if (k.includes('._stemmed_')) {
						// NOTE If multiple languages, the latter will overwrite the first. A single nodes with multiple lanugages is unsupported.
						const kWithoutStemmed = k.split('._stemmed_')[0];
						//log.debug(`k:${k} kWithoutStemmed:${kWithoutStemmed}`);
						obj[kWithoutStemmed] = highlight[k];
						washedNode[kWithoutStemmed] = highlight[k][0];
					} else {
						if(!obj[k]) { // From fulltext
							obj[k] = highlight[k];
							washedNode[k] = highlight[k][0];
						}
					}
				});
			}

			//log.debug(`repoId:${repoId} repoIdObj[repoId]:${toStr(repoIdObj[repoId])}`);
			const {
				collectionId,
				collectionName,
				documentTypeId,
				documentTypeName
			} = repoIdObj[repoId];

			/* eslint-disable no-underscore-dangle */
			washedNode._collectionId = collectionId;
			washedNode._collectionName = collectionName;
			washedNode._documentTypeId = documentTypeId;
			washedNode._documentTypeName = documentTypeName; // NOTE This could be used in unionType typeresolver to determine documentType
			washedNode._highlight = obj;
			washedNode._json = json;
			washedNode._repoId = repoId; // Same info in _collection
			washedNode._score = score;
			/* eslint-enable no-underscore-dangle */
			return washedNode;
		});
		//log.debug(`queryRes:${toStr(queryRes)}`);

		return queryRes;
	} // queryRes.hits.map

	const objectTypeInterfaceSearchHit = createObjectType({
		name: 'InterfaceSearchHits',
		fields: interfaceSearchHitsFields
	});

	const documentTypesUnion = createUnionType({
		name: 'DocumentTypesUnion',
		/*types: [
			//reference('InterfaceSearchHits')
			objectTypeInterfaceSearchHit
		],*/
		//types: Object.values(documentTypeObjectTypes), // Object.values is not a function
		types: Object.keys(documentTypeObjectTypes).map((documentTypeName) => documentTypeObjectTypes[documentTypeName]),
		// Perhaps this has smaller footprint?
		//types: Object.keys(documentTypeObjectTypes).map((documentTypeName) => reference(documentTypeNameToGraphQLObjectTypeName(documentTypeName))),
		typeResolver(node) {
			//log.debug(`node:${toStr(node)}`);
			const {
				//_documentTypeId
				_documentTypeName
			} = node;
			//return objectTypeInterfaceSearchHit;
			return documentTypeObjectTypes[_documentTypeName]; // eslint-disable-line no-underscore-dangle
		}
	});

	//const OBJECT_TYPE_AGGREGATIONS_NAME = 'InterfaceSearchAggregations';
	const objectTypeInterfaceSearch = createObjectType({
		name: 'InterfaceSearch',
		fields: {
			aggregations: { type: list(OBJECT_TYPE_AGGREGATIONS_UNION) },
			aggregationsAsJson: { type: GraphQLJson },
			count: { type: nonNull(GraphQLInt) },
			//hits: { type: list(objectTypeInterfaceSearchHit)},
			hits: { type: list(documentTypesUnion)},
			total: { type: nonNull(GraphQLInt) }
		}
	});

	//──────────────────────────────────────────────────────────────────────────
	// Dynamic Input Types
	//──────────────────────────────────────────────────────────────────────────

	const inputTypeAggregationCount = createInputObjectType({
		name: 'InputObjectTypeAggregationCount',
		fields: {
			field: {
				type: nonNull(enumFieldsKeysForAggreations)
			}
		}
	});
	const inputTypeAggregationDateHistogram = createInputObjectType({
		name: 'InputObjectTypeAggregationDateHistogram',
		fields: {
			field: {
				type: nonNull(enumFieldsKeysForAggreations)
			},
			format: { // yyyy-MM-dd’T’HH:mm:ss.SSSZ
				type: GraphQLString
			},
			interval: { // y M d H m s
				type: GraphQLString
			},
			minDocCount: {
				type: GraphQLInt
			}
		}
	});
	const inputTypeAggregationDateRange = createInputObjectType({
		name: 'InputObjectTypeAggregationDateRange',
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFieldsKeysForAggreations)
			},
			format: { // yyyy-MM-dd’T’HH:mm:ss.SSSZ
				type: GraphQLString
			},
			ranges: {
				type: list(createInputObjectType({
					name: 'InputObjectTypeAggregationDateRangeRanges',
					fields: {
						from: { type: GraphQLString },
						to: { type: GraphQLString }
					}
				}))
			}
		}
	});
	const inputTypeAggregationGeoDistance = createInputObjectType({
		name: 'InputObjectTypeAggregationGeoDistance',
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFieldsKeysForAggreations)
			},
			origin: {
				type: createInputObjectType({
					name: 'InputObjectTypeAggregationGeoDistanceOrigin',
					fields: {
						lat: { type: GraphQLString },
						lon: { type: GraphQLString }
					}
				})
			},
			ranges: {
				type: list(createInputObjectType({
					name: 'InputObjectTypeAggregationGeoDistanceRanges',
					fields: {
						from: { type: GraphQLFloat },
						to: { type: GraphQLFloat }
					}
				}))
			},
			unit: {
				type: nonNull(GRAPHQL_ENUM_TYPE_AGGREGATION_GEO_DISTANCE_UNIT)
			}
		}
	});
	const inputTypeAggregationMax = createInputObjectType({
		name: 'InputObjectTypeAggregationMax',
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFieldsKeysForAggreations)
			}
		}
	});
	const inputTypeAggregationMin = createInputObjectType({
		name: 'InputObjectTypeAggregationMin',
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFieldsKeysForAggreations)
			}
		}
	});
	const inputTypeAggregationRange = createInputObjectType({
		name: 'InputObjectTypeAggregationRange',
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFieldsKeysForAggreations)
			},
			ranges: {
				type: list(createInputObjectType({
					name: 'InputObjectTypeAggregationRangeRanges',
					fields: {
						from: { type: GraphQLFloat },
						to: { type: GraphQLFloat }
					}
				}))
			}
		}
	});
	const inputTypeAggregationStats = createInputObjectType({
		name: 'InputObjectTypeAggregationStats',
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFieldsKeysForAggreations)
			}
		}
	});
	const inputTypeAggregationTerms = createInputObjectType({
		name: 'InputObjectTypeAggregationTerms',
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFieldsKeysForAggreations)
			},
			order: {
				type: GraphQLString
			},
			size: {
				type: GraphQLInt
			},
			minDocCount: {
				type: GraphQLInt
			}
		}
	});

	const inputObjectTypeAggregations = createInputObjectType({
		name: 'InputObjectTypeAggregations',
		fields: {
			name: { type: nonNull(GraphQLString) },
			count: { type: inputTypeAggregationCount },
			dateHistogram: { type: inputTypeAggregationDateHistogram },
			dateRange: { type: inputTypeAggregationDateRange },
			geoDistance: { type: inputTypeAggregationGeoDistance },
			// max, min and stats makes no sense on top level
			range: { type: inputTypeAggregationRange },
			terms: { type: inputTypeAggregationTerms },
			subAggregations: {
				type: list(createInputObjectType({
					name: INPUT_OBJECT_TYPE_SUB_AGGREGATIONS_NAME,
					fields: {
						name: { type: nonNull(GraphQLString) },
						count: { type: inputTypeAggregationCount },
						dateHistogram: { type: inputTypeAggregationDateHistogram },
						dateRange: { type: inputTypeAggregationDateRange },
						geoDistance: { type: inputTypeAggregationGeoDistance },
						max: { type: inputTypeAggregationMax },
						min: { type: inputTypeAggregationMin },
						stats: { type: inputTypeAggregationStats },
						range: { type: inputTypeAggregationRange },
						terms: { type: inputTypeAggregationTerms },
						subAggregations: {
							type: list(reference(INPUT_OBJECT_TYPE_SUB_AGGREGATIONS_NAME))
						}
					} // fields
				}))
			}
		} // fields
	});

	const inputObjectTypeFilters = createInputObjectType({
		name: 'FiltersParameter',
		fields: {
			boolean: {
				//type: GRAPHQL_INPUT_TYPE_FILTER_BOOLEAN
				type: graphqlInputTypeFilterBooleanWithDynamicFields
			},
			exists: {
				//type: GRAPHQL_INPUT_TYPE_FILTER_EXISTS
				type: graphqlInputTypeFilterExistsWithDynamicFields
			},
			hasValue: {
				//type: GRAPHQL_INPUT_TYPE_FILTER_HAS_VALUE
				type: graphqlInputTypeFilterHasValueWithDynamicFields
			},
			ids: { type: GRAPHQL_INPUT_TYPE_FILTER_IDS },
			notExists: {
				//type: GRAPHQL_INPUT_TYPE_FILTER_NOT_EXISTS
				type: graphqlInputTypeFilterNotExistsWithDynamicFields
			}
		}
	});

	const inputObjectTypeHighlight = createInputObjectType({
		name: 'HighlightParameter',
		fields: {
			encoder: { type: GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ENCODER }, // Global only
			fragmenter: { type: GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_FRAGMENTER },
			fragmentSize: { type: GraphQLInt },
			noMatchSize: { type: GraphQLInt },
			numberOfFragments: { type: GraphQLInt },
			order: { type: GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ORDER },
			postTag: { type: GraphQLString },
			preTag: { type: GraphQLString },
			requireFieldMatch: { type: GraphQLBoolean },
			tagsSchema: { type: GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_TAG_SCHEMA }, // Global only
			properties: { type: highlightProperties }
		}
	});

	return createSchema({
		//dictionary:,
		//mutation:,
		query: createObjectType({
			name: 'Query',
			fields: {
				getSearchConnection: {
					args: {
						after: GraphQLString,
						aggregations: list(inputObjectTypeAggregations),
						filters: inputObjectTypeFilters,
						first: GraphQLInt,
						highlight: inputObjectTypeHighlight,
						searchString: GraphQLString
					},
					resolve(env) {
						//log.debug(`env:${toStr({env})}`);
						const {
							after,// = encodeCursor('0'), // encoded representation of start
							aggregations,
							filters,
							first = 10, // count
							highlight,
							searchString
						} = env.args;
						//log.debug(`after:${toStr({after})}`);
						//log.debug(`first:${toStr({first})}`);
						const start = after ? parseInt(decodeCursor(after)) + 1 : 0;
						//log.debug(`start:${toStr({start})}`);
						const res = searchResolver({
							args: {
								aggregations,
								count: first,
								filters,
								highlight,
								searchString,
								start
							}
						});
						//log.debug(`res:${toStr({res})}`);
						res.start = start;
						//log.debug(`res:${toStr({res})}`);
						return res;
					},
					//type: createConnectionType(schemaGenerator, objectTypeInterfaceSearch)
					type: createObjectType({
						name: 'InterfaceSearchConnection',
						fields: {
							totalCount: {
								resolve: (env) => env.source.total,
								type: nonNull(GraphQLInt)
							},
							edges: {
								resolve(env) {
									//log.debug(`edges env:${toStr({env})}`);
									let hits = env.source.hits;
									let edges = [];
									for (let i = 0; i < hits.length; i++) {
										edges.push({
											node: hits[i],
											cursor: env.source.start + i
										});
									}
									//log.debug(`edges:${toStr({edges})}`);
									return edges;
								},
								type: list(createObjectType({
									name: 'InterfaceSearchConnectionEdge',
									fields: {
										cursor: {
											type: nonNull(GraphQLString),
											resolve(env) {
												//log.debug(`cursor env:${toStr({env})}`);
												return env.source.cursor;
											}
										},
										node: {
											type: objectTypeInterfaceSearchHit,
											resolve(env) {
												//log.debug(`node env:${toStr({env})}`);
												return env.source.node;
											}
										}
									}
								}))
							},
							pageInfo: {
								resolve(env) {
									let count = env.source.hits.length;
									return {
										startCursor: env.source.start,
										endCursor: env.source.start + (count === 0 ? 0 : (count - 1)),
										hasNext: (env.source.start + count) < env.source.total
									};
								},
								type: createObjectType({
									name: 'InterfaceSearchConnectionPageInfo',
									fields: {
										endCursor: {
											type: nonNull(GraphQLString),
											resolve: (env) => encodeCursor(env.source.endCursor)
										},
										hasNext: {
											type: nonNull(GraphQLBoolean),
											resolve: (env) => env.source.hasNext
										},
										startCursor: {
											type: nonNull(GraphQLString),
											resolve: (env) => encodeCursor(env.source.startCursor)
										}
									}
								})
							},
							aggregations: { type: list(OBJECT_TYPE_AGGREGATIONS_UNION) },
							aggregationsAsJson: { type: GraphQLJson }
						}
					})
				},
				search: {
					args: {
						aggregations: list(inputObjectTypeAggregations),
						count: GraphQLInt,
						filters: inputObjectTypeFilters,
						highlight: inputObjectTypeHighlight,
						searchString: GraphQLString,
						start: GraphQLInt
					},
					resolve: (env) => searchResolver(env),
					type: objectTypeInterfaceSearch
				}
			}
		})
		//subscription:
	});
}

/* Example query:
{
  search(
    aggregations: {
      name: "a"
      #count:
      terms: {
        field: language
        size: 10
        minDocCount: 1
      }
    }
    count: 1
    filters: {
      exists: {
        field: location
      }
    }
    highlight: {
      #encoder: default
      #fragmenter: simple
      fragmentSize: 255
      #noMatchSize: 0
      #numberOfFragments: 1
      order: none
      postTag: "</b>"
      preTag: "<b>"
      #requireFieldMatch: true
      #tagsSchema: styled
      properties: {
        text: {}
      	title: {}
        uri: {}
      }
    }
    searchString: "whatever"
    start: 0
  ) {
    #aggregations {
    	#__typename
      #... on AggregationTerms {
        #name
        #buckets {
          #key
          #docCount
        #}
      #}
		#}
    #aggregationsAsJson
    #count
    #total
    hits {
      #_collectionId
      #_collectionName
      #_documentTypeId
      #_documentTypeName
      #_highlight {
        #text
        #title
        #uri
      #}
      #_json
      #_repoId
      #_score
      available_as_boolean
      available_as_double
      available_as_geoPoint
      available_as_instant
      available_as_localDate
      #available_as_localDateTime
      available_as_localTime
      available_as_long
      available_as_reference
      available_as_string
      count_as_boolean
      count_as_double
      count_as_geoPoint
      count_as_instant
      count_as_localDate
      #count_as_localDateTime
      count_as_localTime
      count_as_long
      count_as_reference
      count_as_string
      date_as_boolean
      date_as_double
      date_as_geoPoint
      date_as_instant
      date_as_localDate
      #date_as_localDateTime
      date_as_localTime
      date_as_long
      date_as_reference
      date_as_string
      datetime_as_boolean
      datetime_as_double
      datetime_as_geoPoint
      datetime_as_instant
      datetime_as_localDate
      #datetime_as_localDateTime
      datetime_as_localTime
      datetime_as_long
      datetime_as_reference
      datetime_as_string
      time_as_boolean
      time_as_double
      time_as_geoPoint
      time_as_instant
      time_as_localDate
      #time_as_localDateTime
      time_as_localTime
      time_as_long
      time_as_reference
      time_as_string
      instant_as_boolean
      instant_as_double
      instant_as_geoPoint
      instant_as_instant
      instant_as_localDate
      #instant_as_localDateTime
      instant_as_localTime
      instant_as_long
      instant_as_reference
      instant_as_string
      price_as_boolean
      price_as_double
      price_as_geoPoint
      price_as_instant
      price_as_localDate
      #price_as_localDateTime
      price_as_localTime
      price_as_long
      price_as_reference
      price_as_string
      #language
      language_as_boolean
      language_as_double
      language_as_geoPoint
      language_as_instant
      language_as_localDate
      #language_as_localDateTime
      language_as_localTime
      language_as_long
      language_as_reference
      language_as_string
      location_as_boolean
      location_as_double
      location_as_geoPoint
      location_as_instant
      location_as_localDate
      #location_as_localDateTime
      location_as_localTime
      location_as_long
      location_as_reference
      location_as_string
      #informationType
      #source
      #text
      #title
      #uri
    }
  }
}
*/
