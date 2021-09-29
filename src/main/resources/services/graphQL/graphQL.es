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

import {toStr} from '@enonic/js-utils';

import {
	execute
} from '/lib/graphql';

import {RT_JSON} from '/lib/explorer/model/2/constants';

import {Glue} from './Glue';

import {generateGetContentTypesField} from './generateGetContentTypesField';
import {generateGetLicenseField} from './generateGetLicenseField';
import {generateGetLocalesField} from './generateGetLocalesField';
import {generateGetSitesField} from './generateGetSitesField';
import {generateInterfaces} from './generateInterfaces';
import {generateListTasksField} from './generateListTasksField';
import {generateNoQLTypes} from './generateNoQLTypes';
import {generateQueryJournalsField} from './generateQueryJournalsField';
import {generateQueryStopWordsField} from './generateQueryStopWordsField';
import {generateReferencedByField} from './generateReferencedByField';
import {generateTypes} from './generateTypes';


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


const glue = new Glue();

generateTypes({glue});
generateNoQLTypes({glue});

const {schemaGenerator} = glue;

const queryApiKeysField = generateQueryApiKeysField({
	glue
});

const {
	createCollectionField,
	queryCollectionsField,
	reindexCollectionsField,
	updateCollectionField
} = generateCollectionFields({
	glue
});

const {
	createDocumentTypeField,
	deleteDocumentTypeField,
	getDocumentTypeField,
	queryDocumentTypesField,
	updateDocumentTypeField
} = generateDocumentTypeFields({
	glue
});

const {
	createFieldField,
	deleteFieldField,
	queryFieldsField,
	updateFieldField
} = generateFieldsField({
	glue
});

const getContentTypesField = generateGetContentTypesField({
	schemaGenerator
});

generateSchedulerTypes({
	glue
});

const {
	createSynonymField,
	deleteSynonymField,
	querySynonymsField,
	updateSynonymField
} = generateSynonymFields({
	glue
});

const {
	createThesaurusField,
	deleteThesaurusField,
	queryThesauriField,
	updateThesaurusField
} = generateThesaurusFields({
	glue
});

generateInterfaces({
	glue
});

const getLicense = generateGetLicenseField({
	glue
});

const getLocales = generateGetLocalesField({
	glue
});

const getSites = generateGetSitesField({
	glue
});

const listScheduledJobs = generateScheduledJobsListField({
	glue
});

const queryCollectors = generateQueryCollectorsField({
	glue
});

const queryInterfaces = generateQueryInterfacesField({
	glue
});

const queryJournals = generateQueryJournalsField({
	glue
});

const queryStopWords = generateQueryStopWordsField({
	glue
});

const queryTasks = generateListTasksField({
	glue
});

const referencedBy = generateReferencedByField({
	glue
});

const mutation = glue.addObjectType({
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

const query = glue.addObjectType({
	name: 'Query',
	fields: {
		getContentTypes: getContentTypesField,
		getLicense,
		getLocales,
		getDocumentType: getDocumentTypeField,
		getSites,
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

const {
	createSchema
} = schemaGenerator;

log.debug(`glue.getSortedObjectTypeNames():${toStr(glue.getSortedObjectTypeNames())}`);

//const objectTypes = glue.getObjectTypes();

export const SCHEMA = createSchema({
	//dictionary: Object.keys(objectTypes).map((k) => objectTypes[k]), // Necessary for types accessed through references
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
