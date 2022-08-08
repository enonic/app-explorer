/*
                  Explorer repo                             Collection repos
      ┌─────────────────┼───────────────────┐                      │
┌─────┴─────┐   ┌───────┴───────┐   ┌───────┴────────┐     ┌───────┴────────┐
│ Field     │   │ Document type │   │ Collection     │     │ Document       │
├───────────┤Ref├───────────────┤Ref├────────────────┤Loose├────────────────┤
│ _id       │<──┤ fieldIds      │<──┤ documentTypeId │<────┤ collectionName │
│ fieldPath │   │ fieldPaths    │   │                │     │ fieldPaths     │
└───────────┘   └───────────────┘   └────────────────┘     └───────┬────────┘
     ^               ^                                        Loose│
     └───────────────┴─────────────────────────────────────────────┘
*/
import type {Request} from '../../types/index.d';


import {
	RESPONSE_TYPE_JSON//,
	//toStr
} from '@enonic/js-utils';

import {
	execute
	//@ts-ignore
} from '/lib/graphql';


import {Glue} from './Glue';

import {addScalarTypes} from './addScalarTypes';
import {addInputTypes} from './addInputTypes';
import {addGraphQLInterfaceTypes} from './addGraphQLInterfaceTypes';
import {addObjectTypes} from './addObjectTypes';

import {generateGetContentTypesField} from './generateGetContentTypesField';
import {generateGetLicenseField} from './generateGetLicenseField';
import {generateGetLocalesField} from './generateGetLocalesField';
import {generateGetSitesField} from './generateGetSitesField';
import {generateQueryJournalsField} from './generateQueryJournalsField';
import {generateReferencedByField} from './generateReferencedByField';

import {addApiKeyTypes} from './apiKey/addApiKeyTypes';
import {addMutationApiKeyCreate} from './apiKey/addMutationApiKeyCreate';
import {addMutationApiKeyDelete} from './apiKey/addMutationApiKeyDelete';
import {addMutationApiKeyUpdate} from './apiKey/addMutationApiKeyUpdate';
import {generateQueryApiKeysField} from './apiKey/generateQueryApiKeysField';

import {generateCollectionFields} from './collection/generateCollectionFields';
import {generateQueryCollectorsField} from './collector/generateQueryCollectorsField';
import {generateFieldsField} from './field/generateFieldsField';
import {addQueryFieldGet} from './field/addQueryFieldGet';

import {addQueryDocuments} from './document/addQueryDocuments';

import {addInterfaceTypes as addExplorerInterfaceTypes} from './interface/addInterfaceTypes';
import {addMutationInterfaceCreate} from './interface/addMutationInterfaceCreate';
import {addMutationInterfaceDelete} from './interface/addMutationInterfaceDelete';
import {addMutationInterfaceUpdate} from './interface/addMutationInterfaceUpdate';
import {addQueryInterfaceGet} from './interface/addQueryInterfaceGet';
import {generateQueryInterfacesField} from './interface/generateQueryInterfacesField';

import {generateScheduledJobsListField} from './scheduler/generateScheduledJobsListField';
import {generateSchedulerTypes} from './scheduler/generateSchedulerTypes';
import {generateDocumentTypeFields} from './documentType/generateDocumentTypeFields';
import {generateSynonymFields} from './synonym/generateSynonymFields';

import {addGetThesaurus} from './thesaurus/addGetThesaurus'
import {addMutationThesaurusCreate} from './thesaurus/addMutationThesaurusCreate'
import {addMutationThesaurusUpdate} from './thesaurus/addMutationThesaurusUpdate'
import {addThesaurusTypes} from './thesaurus/addThesaurusTypes';
import {generateThesaurusFields} from './thesaurus/generateThesaurusFields';
import {addMutationMigrateThesaurusSynonyms_v1_to_v2} from './thesaurus/addMutationMigrateThesaurusSynonyms_v1_to_v2';
import {addMutationThesaurusImport} from './thesaurus/addMutationThesaurusImport'

import {addStopWordsTypes} from './stopWords/addStopWordsTypes';
import {generateQueryStopWordsField} from './stopWords/generateQueryStopWordsField';
import {addStopWordsCreate} from './stopWords/addStopWordsCreate';
import {addStopWordsDelete} from './stopWords/addStopWordsDelete';
import {addStopWordsUpdate} from './stopWords/addStopWordsUpdate';

import {addTaskTypes} from './task/addTaskTypes';
import {addQueryGetTask} from './task/addQueryGetTask';
import {addQueryQueryTasks} from './task/addQueryQueryTasks';


import {hasFieldQuery} from './hasFieldQuery';
import {addUnionTypes} from './addUnionTypes';
import {addExplorerRepoNodesGetQuery} from './addExplorerRepoNodesGetQuery';
import {createObjectTypesUsingUnionTypes} from './createObjectTypesUsingUnionTypes';


//const {currentTimeMillis} = Java.type('java.lang.System');

const glue = new Glue();

// There is a bit of a chicken and egg problem with
// interface-, and object-types as they can use each other.
//
// Inside and interfaceType resolver I believe you cannot use lib-graphql.reference,
// but this is not a problem.
// Instead first create an "global" object (which JS passes as a reference).
// Then inside the interfaceType resolver, get the objectType you need from some property in that object.
// It doesn't matter that the property is not set yet,
// as long as you set it before the interfaceType resolver is run.
// Thus when you define the objectType also add it to the global object.
//
// When defining an objectType to implement an interfaceType you are allowed to use lib-graphql.reference,
// so that's not a problem.
//
// When implementing an interface type inside an objectType,
// I want to avoid copyNpaste of the same fields into ALL the objectTypes which
// implement the interface type.
// Even though you will get a runtime error to spot your mistake,
// it's better to not make the mistake.
// So I want to define the interfaceType fields first and the use the both in
// the interfaceType and objectTypes.
//
// NOTE The challenge then is that some interfaceType field use objectTypes,
// lets see if lib-graphql.reference can be used?


// Can be first since it doesn't depend on anything
addScalarTypes({glue});

// Must be after ScalarTypes!
// Should be before InterfaceTypes (unless we use lib-graphql.reference)
// Must be before ObjectTypes?
addInputTypes({glue});

// Must be before InterfaceTypes!
addUnionTypes({glue});
addExplorerRepoNodesGetQuery({glue});

// Must be after ScalarTypes!
// Must be after InputTypes
// Must be after UnionTypes
// Must be before ObjectTypes
addGraphQLInterfaceTypes({glue});

// Must be after ScalarTypes!
// Must be after InputTypes?
// Must be after InterfaceTypes
addObjectTypes({glue});


// GIVEN we want to define an interfaceType fields,
//       at the same time that we define the interfaceType
// WHEN any objectType spreads that interfaceType fields
// THEN that objectType needs to be defined after the interfaceType
// AND any objectType used in an interfaceType field must be lib-graphql.reference
// AND you can use either getInterFaceType or lib-graphql.reference in that objectType interfaces:[]

// IF interfaceType fields are first defined
// THEN they can be used/spread both when defining the interfaceType and the objectTypes.


// ObjectTypes which implements interfaces
// https://github.com/enonic/lib-graphql/blob/master/docs/api.adoc#createobjecttype
// interfaces: Array<GraphQLInterfaceType OR GraphQLTypeReference>

const referencedBy = generateReferencedByField({glue});

addApiKeyTypes({glue});
addMutationApiKeyCreate({glue});
addMutationApiKeyDelete({glue});
addMutationApiKeyUpdate({glue});
const queryApiKeysField = generateQueryApiKeysField({glue});

const hasField = hasFieldQuery({glue});

const {
	createCollectionField,
	queryCollectionsField,
	reindexCollectionsField,
	updateCollectionField
} = generateCollectionFields({glue});

addQueryDocuments({glue});

const {
	createDocumentTypeField,
	deleteDocumentTypeField,
	getDocumentTypeField,
	updateDocumentTypeField
} = generateDocumentTypeFields({glue});

const {
	createFieldField,
	deleteFieldField,
	queryFieldsField,
	updateFieldField
} = generateFieldsField({glue});
addQueryFieldGet({glue});

const getContentTypesField = generateGetContentTypesField({glue});

generateSchedulerTypes({glue});

const {
	deleteSynonymField
} = generateSynonymFields({glue});

addTaskTypes({glue});
addThesaurusTypes({
	glue
});
addMutationThesaurusCreate({glue});
addMutationThesaurusUpdate({glue});
addGetThesaurus({glue});
const {
	deleteThesaurusField,
	queryThesauriField,
} = generateThesaurusFields({glue});
addMutationMigrateThesaurusSynonyms_v1_to_v2({glue});
addMutationThesaurusImport({glue});


const getLicense = generateGetLicenseField({glue});
const getLocales = generateGetLocalesField({glue});
const getSites = generateGetSitesField({glue});
const listScheduledJobs = generateScheduledJobsListField({glue});
const queryCollectors = generateQueryCollectorsField({glue});

addExplorerInterfaceTypes({glue});
addMutationInterfaceCreate({glue});
addMutationInterfaceDelete({glue});
addMutationInterfaceUpdate({glue});
addQueryInterfaceGet({glue});
const queryInterfaces = generateQueryInterfacesField({glue});

const queryJournals = generateQueryJournalsField({glue});

addStopWordsTypes({glue});
addStopWordsCreate({glue});
addStopWordsDelete({glue});
addStopWordsUpdate({glue});
const queryStopWords = generateQueryStopWordsField({glue});

addQueryGetTask({glue});
addQueryQueryTasks({glue});

const {
	queryDocumentTypesField
} = createObjectTypesUsingUnionTypes({glue});

//const mutation = glue.addObjectType({
const mutation = glue.schemaGenerator.createObjectType({
	name: 'Mutation',
	fields: {
		...glue.getMutations(),
		createCollection: createCollectionField,
		createDocumentType: createDocumentTypeField,
		createField: createFieldField,

		deleteDocumentType: deleteDocumentTypeField,
		deleteField: deleteFieldField,
		deleteSynonym: deleteSynonymField,
		deleteThesaurus: deleteThesaurusField,

		updateCollection: updateCollectionField,
		updateDocumentType: updateDocumentTypeField,
		updateField: updateFieldField,

		reindexCollections: reindexCollectionsField
	}
});

//const query = glue.addObjectType({
const query = glue.schemaGenerator.createObjectType({
	name: 'Query',
	fields: {
		...glue.getQueries(),
		getContentTypes: getContentTypesField,
		getLicense,
		getLocales,
		getDocumentType: getDocumentTypeField,
		getSites,
		hasField,
		listScheduledJobs,
		queryApiKeys: queryApiKeysField,
		queryCollections: queryCollectionsField,
		queryCollectors,
		queryFields: queryFieldsField,
		queryInterfaces,
		queryJournals,
		queryStopWords,
		queryDocumentTypes: queryDocumentTypesField,
		queryThesauri: queryThesauriField,
		referencedBy
	} // fields
}); // query

//log.debug(`glue.getSortedObjectTypeNames():${toStr(glue.getSortedObjectTypeNames())}`);

//const objectTypes = glue.getObjectTypes();
//const unionTypes = glue.getUnionTypes();

export const SCHEMA = glue.schemaGenerator.createSchema({
	//dictionary: Object.keys(objectTypes).map((k) => objectTypes[k]), // Necessary for types accessed through references
	//dictionary: Object.keys(unionTypes).map((k) => unionTypes[k]), // Necessary for types accessed through references
	mutation,
	query
}); // SCHEMA


export function post(request :Request) {
	//log.info(`request:${toStr(request)}`);

	const {body: bodyJson} = request;
	//log.info(`bodyJson:${toStr(bodyJson)}`);

	const body = JSON.parse(bodyJson);
	//log.info(`body:${toStr(body)}`);

	const {query, variables} = body;
	//log.info(`query:${toStr(query)}`);
	//log.info(`variables:${toStr(variables)}`);

	const context = {
		/*types: [
			GQL_INTERFACE_NODE // This is not the place to add interfaceTypes. lib-guillotine context is something else...
		]*/
	};
	//log.info(`context:${toStr(context)}`);

	//const before = currentTimeMillis();
	const obj = execute(SCHEMA, query, variables, context);
	//const after = currentTimeMillis();
	//const duration = after - before;
	//log.debug(`Duration: ${duration}ms Query:${query}`);

	return {
		contentType: RESPONSE_TYPE_JSON,
		body: //JSON.stringify( // TODO This is causeing problems, commenting it out until I can look at all of them.
			// NOTE This add null values for missing properties
			obj
		//)
	};
} // post
