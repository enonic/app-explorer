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

//import {toStr} from '@enonic/js-utils';

import {
	execute
} from '/lib/graphql';

import {RT_JSON} from '/lib/explorer/model/2/constants';

import {Glue} from './Glue';

import {addScalarTypes} from './addScalarTypes';
import {addInputTypes} from './addInputTypes';
import {addGraphQLInterfaceTypes} from './addGraphQLInterfaceTypes';
import {addObjectTypes} from './addObjectTypes';

import {generateGetContentTypesField} from './generateGetContentTypesField';
import {generateGetLicenseField} from './generateGetLicenseField';
import {generateGetLocalesField} from './generateGetLocalesField';
import {generateGetSitesField} from './generateGetSitesField';
import {generateListTasksField} from './generateListTasksField';
import {generateQueryJournalsField} from './generateQueryJournalsField';
import {generateQueryStopWordsField} from './generateQueryStopWordsField';
import {generateReferencedByField} from './generateReferencedByField';

import {generateQueryApiKeysField} from './apiKey/generateQueryApiKeysField';
import {generateCollectionFields} from './collection/generateCollectionFields';
import {generateQueryCollectorsField} from './collector/generateQueryCollectorsField';
import {generateFieldsField} from './field/generateFieldsField';
import {generateQueryInterfacesField} from './interface/generateQueryInterfacesField';
import {generateScheduledJobsListField} from './scheduler/generateScheduledJobsListField';
import {generateSchedulerTypes} from './scheduler/generateSchedulerTypes';
import {generateDocumentTypeFields} from './documentType/generateDocumentTypeFields';
import {generateSynonymFields} from './synonym/generateSynonymFields';
import {generateThesaurusFields} from './thesaurus/generateThesaurusFields';

import {hasFieldQuery} from './hasFieldQuery';
import {addUnionTypes} from './addUnionTypes';
import {createObjectTypesUsingUnionTypes} from './createObjectTypesUsingUnionTypes';

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

const queryApiKeysField = generateQueryApiKeysField({glue});

const hasField = hasFieldQuery({glue});

const {
	createCollectionField,
	queryCollectionsField,
	reindexCollectionsField,
	updateCollectionField
} = generateCollectionFields({glue});

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

const getContentTypesField = generateGetContentTypesField({glue});

generateSchedulerTypes({glue});

const {
	createSynonymField,
	deleteSynonymField,
	querySynonymsField,
	updateSynonymField
} = generateSynonymFields({glue});

const {
	createThesaurusField,
	deleteThesaurusField,
	queryThesauriField,
	updateThesaurusField
} = generateThesaurusFields({glue});

const getLicense = generateGetLicenseField({glue});
const getLocales = generateGetLocalesField({glue});
const getSites = generateGetSitesField({glue});
const listScheduledJobs = generateScheduledJobsListField({glue});
const queryCollectors = generateQueryCollectorsField({glue});
const queryInterfaces = generateQueryInterfacesField({glue});
const queryJournals = generateQueryJournalsField({glue});
const queryStopWords = generateQueryStopWordsField({glue});
const queryTasks = generateListTasksField({glue});

const {
	queryDocumentTypesField
} = createObjectTypesUsingUnionTypes({glue});

//const mutation = glue.addObjectType({
const mutation = glue.schemaGenerator.createObjectType({
	name: 'Mutation',
	fields: {
		createCollection: createCollectionField,
		createDocumentType: createDocumentTypeField,
		createField: createFieldField,
		createSynonym: createSynonymField,
		createThesaurus: createThesaurusField,

		deleteDocumentType: deleteDocumentTypeField,
		deleteField: deleteFieldField,
		deleteSynonym: deleteSynonymField,
		deleteThesaurus: deleteThesaurusField,

		updateCollection: updateCollectionField,
		updateDocumentType: updateDocumentTypeField,
		updateField: updateFieldField,
		updateSynonym: updateSynonymField,
		updateThesaurus: updateThesaurusField,

		reindexCollections: reindexCollectionsField
	}
});

//const query = glue.addObjectType({
const query = glue.schemaGenerator.createObjectType({
	name: 'Query',
	fields: {
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
		querySynonyms: querySynonymsField,
		queryDocumentTypes: queryDocumentTypesField,
		queryThesauri: queryThesauriField,
		queryTasks,
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


export function post(request) {
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

	return {
		contentType: RT_JSON,
		body: //JSON.stringify( // TODO This is causeing problems, commenting it out until I can look at all of them.
			// NOTE This add null values for missing properties,
			// but also causes default values in deconstruction to fail :(
			execute(SCHEMA, query, variables, context)
		//)
	};
} // post
