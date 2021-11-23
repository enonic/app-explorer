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
import 'reflect-metadata';
//import serialize from 'serialize-javascript';
import setIn from 'set-value'; // Number.isInteger and Reflect

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
	GraphQLInt,
	GraphQLString,
	list,
	newSchemaGenerator
} from '/lib/graphql';
import {decodeCursor} from '/lib/graphql-connection';

import {
	GQL_ENUM_HIGHLIGHT_OPTION_ENCODERS,
	GQL_ENUM_HIGHLIGHT_OPTION_FRAGMENTERS,
	GQL_ENUM_HIGHLIGHT_OPTION_ORDERS,
	GQL_ENUM_HIGHLIGHT_OPTION_TAG_SCHEMAS,
	GQL_INPUT_TYPE_AGGREGATION,
	GQL_INPUT_TYPE_FILTERS,
	GQL_INPUT_TYPE_HIGHLIGHT,
	GQL_INTERFACE_TYPE_DOCUMENT,
	GQL_OBJECT_TYPE_INTERFACE_SEARCH,
	GQL_OBJECT_TYPE_INTERFACE_SEARCH_CONNECTION,
	GQL_OBJECT_TYPE_QUERY,
	//GQL_UNION_TYPE_DOCUMENT_TYPES,
	JAVA_MAX_SAFE_INT,
	JAVA_MIN_SAFE_INT,
	VALUE_TYPE_JSON
} from './constants';

import {constructGlue} from './Glue';

import {addStaticEnumTypes} from './addStaticEnumTypes';
import {addStaticInputTypes} from './addStaticInputTypes';
import {addStaticObjectTypes} from './addStaticObjectTypes';
import {addStaticUnionTypes} from './addStaticUnionTypes';

import {aggregationsArgToQueryParamAndTypes} from './aggregationsArgToQueryParamAndTypes';
import {documentTypeNameToGraphQLObjectTypeName} from './documentTypeNameToGraphQLObjectTypeName';
import {objToGraphQL} from './objToGraphQL';
import {queryResAggregationsObjToArray} from './queryResAggregationsObjToArray';
import {valueTypeToGraphQLType} from './valueTypeToGraphQLType';
import {washDocumentNode} from './washDocumentNode';

import {addDynamicEnumTypes} from './addDynamicEnumTypes';
import {addDynamicInputTypes} from './addDynamicInputTypes';
import {addDynamicInterfaceTypes} from './addDynamicInterfaceTypes';
import {addDynamicObjectTypes} from './addDynamicObjectTypes';
import {addDynamicUnionTypes} from './addDynamicUnionTypes';


const schemaGenerator = newSchemaGenerator();
const {createSchema} = schemaGenerator;
//import {DEFAULT_INTERFACE_FIELDS} from '../constants';

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


export function generateSchemaForInterface(interfaceName) {
	const glue = constructGlue({schemaGenerator});

	addStaticEnumTypes(glue);
	addStaticInputTypes(glue);

	const staticHighlightParameterPropertiesFields = {
		fragmenter: { type: glue.getEnumType(GQL_ENUM_HIGHLIGHT_OPTION_FRAGMENTERS) },
		fragmentSize: { type: GraphQLInt },
		noMatchSize: { type: GraphQLInt },
		numberOfFragments: { type: GraphQLInt },
		order: { type: glue.getEnumType(GQL_ENUM_HIGHLIGHT_OPTION_ORDERS) },
		postTag: { type: GraphQLString },
		preTag: { type: GraphQLString },
		requireFieldMatch: { type: GraphQLBoolean }
	};

	const staticHighlightParameterFields = {
		encoder: { type: glue.getEnumType(GQL_ENUM_HIGHLIGHT_OPTION_ENCODERS) }, // Global only
		...staticHighlightParameterPropertiesFields,
		tagsSchema: { type: glue.getEnumType(GQL_ENUM_HIGHLIGHT_OPTION_TAG_SCHEMAS) } // Global only
	};

	addStaticObjectTypes(glue); // Must be before addStaticUnionTypes()
	addStaticUnionTypes(glue); // Must be after addStaticObjectTypes()

	/*function deSerialize(serializedJavascript){
		return eval('(' + serializedJavascript + ')');
	}

	const glue = deSerialize(serialize(staticGlue)); // Clone / DeReference*/

	const explorerRepoReadConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });

	//──────────────────────────────────────────────────────────────────────────
	// In order to make a documentTypesUnion supporting GraphQL inline fragments (... on documentType)
	// I have to make one objectType per documentType and it needs a unqiue name
	// It needs all global fields, and all documentType local fields
	//──────────────────────────────────────────────────────────────────────────
	// 1. Get all global fields, and make a spreadable fields object to reuse and override per docmentType
	//──────────────────────────────────────────────────────────────────────────
	const fieldsRes = getFields({ // Note these are sorted 'key ASC'
		connection: explorerRepoReadConnection,
		includeSystemFields: true
	});
	//log.debug(`fieldsRes:${toStr(fieldsRes)}`);
	//log.debug(`fieldsRes.hits[0]:${toStr(fieldsRes.hits[0])}`);

	/*────────────────────────────────────────────────────────────────────────────
	This document:
		{
			person: {
				age: 30,
				name: 'John'
			}
		}

	Should be covered by this documentType:
		fields: [
			//{ key: 'person', valueType: 'Set' } // This entry is optional
			{ key: 'person.age', valueType: 'Long' }
			{ key: 'person.name', valueType: 'String' }
		]

	Should end up like this GraphQL schema:
		fields: {
			person: {
				type: ObjectType({
					name: 'Person',
					fields: {
						age: { type: GraphQLInt },
						name: { type: GraphQLString }
					}
				})
			}
		}

	Using setIn I can make this intermediary:
		{
			person: {
				_valueType: 'Set',
				age: {
					_valueType: 'Long',
				},
				name: {
					_valueType: 'String',
				}
			}
		}
	And then use traverse to build the GraphQL schema?
	────────────────────────────────────────────────────────────────────────────*/
	const camelToFieldObj = {};
	const nestedFieldsObj = { // NOTE Hardcoded common fields, which are not currently system fields
		_collectionId: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_STRING
		},
		_collectionName: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_STRING
		},
		_documentTypeId: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_STRING
		},
		_documentTypeName: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_STRING
		},
		_json: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_JSON
		},
		//_highlight, // TODO ???
		_repoId: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_STRING
		},
		_score: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_STRING
		}
	};
	fieldsRes.hits.forEach(({ // TODO traverse
		fieldType: valueType,
		inResults,
		//isSystemField = false,
		key,
		max = 0,
		min = 0
	}) => {
		const camelizedFieldPath = key.split('.').map((k) => camelize(k, /[-]/g)).join('.');
		//log.debug(`inResults:${toStr(inResults)} key:${toStr(key)} camelizedFieldPath:${toStr(camelizedFieldPath)}`);

		if (inResults !== false) {
			setIn(nestedFieldsObj, camelizedFieldPath, {
				//_isSystemField: isSystemField,
				_max: max,
				_min: min,
				_valueType: valueType
			}, { merge: true });
		}
	});
	//log.debug(`nestedFieldsObj:${toStr(nestedFieldsObj)}`);

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
	//
	// Global fields can be overridden, let's think about some scenarios:
	//
	// Scenario A:
	//  * Global field person is a Set, with two sub fields name and age
	//  * Local field person is a String
	//  Merged documentType should have person as a String. An no mention of name and age.
	//
	// Scenario B:
	//  * Global field person is a String
	//  * Local field person is a Set with subfields name and age
	//  Merged documentType should have person as a Set with subfields name and age.
	//
	//──────────────────────────────────────────────────────────────────────────

	const documentTypeObjectTypes = {}; // Defined before addDynamicInterfaceTypes, populated after

	//──────────────────────────────────────────────────────────────────────────
	// An objectType per documentType will be generated.
	// Global and "magic" fields will be added to an interfaceType.
	// The list of objectTypes is used both in the interfaceType and unionType resolvers.
	// When we define the resolvers we may use a js-reference to an empty object, which later will contain the objectTypes.
	// When we define the unionType, we can use lib-graphql.reference, but we need to have a list of the objectType names, so we might as well use the objectTypes directly.
	// Q: Can we use lib-graphql.reference in objectType.interfaces?
	//──────────────────────────────────────────────────────────────────────────

	addDynamicInterfaceTypes({
		documentTypeObjectTypes, // Just an empty obj, populated later
		glue
	});

	const interfaceTypeDocument = glue.getInterfaceType(GQL_INTERFACE_TYPE_DOCUMENT);
	documentTypes.forEach(({
		_name: documentTypeName,
		properties
	}) => {
		const mergedNestedFieldsObj = JSON.parse(JSON.stringify(nestedFieldsObj)); // deref
		//log.debug(`documentTypeName:${toStr(documentTypeName)} mergedNestedFieldsObj:${toStr(mergedNestedFieldsObj)}`);

		if (properties) {
			forceArray(properties).forEach(({
				max = 0,
				min = 0,
				name,
				valueType = VALUE_TYPE_STRING
			}) => {
				const camelizedFieldPath = name.split('.').map((k) => camelize(k, /[-]/g)).join('.');
				setIn(mergedNestedFieldsObj, camelizedFieldPath, {
					_max: max,
					_min: min,
					_valueType: valueType
				}, { merge: true });

				//const camelizedFieldKey = camelize(name, /[.-]/g);
				const camelizedFieldKey = camelizedFieldPath;
				if (camelToFieldObj[camelizedFieldKey] && camelToFieldObj[camelizedFieldKey] !== name) {
					throw new Error(`Name collision from camelized:${camelizedFieldKey} to both ${camelToFieldObj[camelizedFieldKey]} and ${name}`);
				}
				camelToFieldObj[camelizedFieldKey] = name;
			}); // properties.forEach
		}
		//log.debug(`documentTypeName:${toStr(documentTypeName)} mergedNestedFieldsObj:${toStr(mergedNestedFieldsObj)}`);

		documentTypeObjectTypes[documentTypeName] = glue.addObjectType({
			name: documentTypeNameToGraphQLObjectTypeName(documentTypeName),
			fields: objToGraphQL({
				documentTypeName,
				glue,
				obj: mergedNestedFieldsObj
			}),
			interfaces: [
				//reference(GQL_INTERFACE_TYPE_DOCUMENT) // Error: type Document not found in schema
				interfaceTypeDocument
			]
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
		highlightParameterPropertiesFields[camelizedFieldKey] = { type: glue.addInputType({
			name: `HighlightParameterProperties${ucFirst(camelizedFieldKey)}`,
			fields: staticHighlightParameterPropertiesFields
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
				/*highlightParameterPropertiesFields[camelizedFieldKey] = { type: glue.addInputType({
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

	addDynamicEnumTypes({
		fieldKeysForAggregations,
		fieldKeysForFilters,
		glue
	});

	addDynamicInputTypes({
		glue,
		highlightParameterPropertiesFields,
		staticHighlightParameterFields
	});

	//──────────────────────────────────────────────────────────────────────────

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

		const [aggregations, types] = aggregationsArgToQueryParamAndTypes({
			aggregationsArray: aggregationsArg,
			camelToFieldObj
		});
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

		queryRes.aggregations = queryResAggregationsObjToArray({
			obj:queryRes.aggregations,
			types
		});
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

			// TODO Traverse based on documentType

			// Old way to provide a field once per all valueTypes (cast into that valueType, or null if cast fails)
			Object.keys(washedNode).forEach((k) => {
				//log.debug(`k:${toStr(k)}`);
				VALUE_TYPE_VARIANTS.forEach((v) => {
					//log.debug(`v:${toStr(v)}`);
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
							log.warning(`Enonic XP should never return GeoPoint as Array??? k:${toStr(k)} v:${toStr(v)} value:${toStr(value)}`);
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
				}); // VALUE_TYPE_VARIANTS.forEach
			}); // Object.keys(washedNode).forEach

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
			} // if (highlight)

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
		}); // queryRes.hits.map
		//log.debug(`queryRes:${toStr(queryRes)}`);

		return queryRes;
	} // searchResolver ?

	// Must be after populating documentTypeObjectTypes
	// Must be before addDynamicObjectTypes
	addDynamicUnionTypes({
		documentTypeObjectTypes, // Must be populated already, since used in types inside
		glue
	});

	addDynamicObjectTypes({ // Must be after addDynamicUnionTypes
		glue,
		interfaceSearchHitsFieldsFromSchema,
		interfaceSearchHitsHighlightsFields
	});

	const objectTypeInterfaceSearch = glue.getObjectType(GQL_OBJECT_TYPE_INTERFACE_SEARCH);
	const inputTypeAggregation = glue.getInputType(GQL_INPUT_TYPE_AGGREGATION);
	const inputTypeFilters = glue.getInputType(GQL_INPUT_TYPE_FILTERS);
	const inputTypeHighlight = glue.getInputType(GQL_INPUT_TYPE_HIGHLIGHT);

	return createSchema({
		//dictionary:,
		//mutation:,
		query: glue.addObjectType({
			name: GQL_OBJECT_TYPE_QUERY,
			fields: {
				getSearchConnection: {
					args: {
						after: GraphQLString,
						aggregations: list(inputTypeAggregation),
						filters: inputTypeFilters,
						first: GraphQLInt,
						highlight: inputTypeHighlight,
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
					type: glue.getObjectType(GQL_OBJECT_TYPE_INTERFACE_SEARCH_CONNECTION)
				},
				search: {
					args: {
						aggregations: list(inputTypeAggregation),
						count: GraphQLInt,
						filters: inputTypeFilters,
						highlight: inputTypeHighlight,
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
      #informationType
      #source
      #text
      #title
      #uri
    }
  }
}
*/
