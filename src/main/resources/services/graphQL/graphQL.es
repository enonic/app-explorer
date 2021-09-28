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
	execute,
	newSchemaGenerator
} from '/lib/graphql';

import {RT_JSON} from '/lib/explorer/model/2/constants';

import {generateGetContentTypesField} from './generateGetContentTypesField';
import {generateGetLicenseField} from './generateGetLicenseField';
import {generateGetLocalesField} from './generateGetLocalesField';
import {generateGetSitesField} from './generateGetSitesField';
import {generateInterfaces} from './generateInterfaces';
import {generateListTasksField} from './generateListTasksField';
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


const schemaGenerator = newSchemaGenerator();

const {
	createObjectType,
	createSchema
} = schemaGenerator;

const {
	GQL_TYPE_COUNT,
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	GQL_TYPE_NODE_DELETED,
	GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH,
	GQL_TYPE_TOTAL,
	GQL_TYPE_VERSION_KEY
} = generateTypes({
	schemaGenerator
});

const queryApiKeysField = generateQueryApiKeysField({
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	//GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH,
	schemaGenerator
});

const {
	GQL_TYPE_COLLECTION,
	createCollectionField,
	queryCollectionsField,
	reindexCollectionsField,
	updateCollectionField
} = generateCollectionFields({
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	GQL_TYPE_NODE_TYPE,
	schemaGenerator
});

const {
	GQL_TYPE_DOCUMENT_TYPE,
	createDocumentTypeField,
	deleteDocumentTypeField,
	getDocumentTypeField,
	queryDocumentTypesField,
	updateDocumentTypeField
} = generateDocumentTypeFields({
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH,
	GQL_TYPE_VERSION_KEY,
	schemaGenerator
});

const {
	GQL_TYPE_FIELD_NODE,
	createFieldField,
	deleteFieldField,
	queryFieldsField,
	updateFieldField
} = generateFieldsField({
	//GQL_INTERFACE_NODE,
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	GQL_TYPE_PATH,
	schemaGenerator
});

const getContentTypesField = generateGetContentTypesField({
	schemaGenerator
});

const {
	GQL_TYPE_JOB
} = generateSchedulerTypes({
	GQL_TYPE_ID,
	schemaGenerator
});

const {
	createSynonymField,
	deleteSynonymField,
	querySynonymsField,
	updateSynonymField,
	GQL_TYPE_SYNONYM
} = generateSynonymFields({
	GQL_TYPE_ID,
	//GQL_TYPE_NAME,
	GQL_TYPE_NODE_DELETED,
	GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH,
	schemaGenerator
});

const {
	createThesaurusField,
	deleteThesaurusField,
	queryThesauriField,
	updateThesaurusField
} = generateThesaurusFields({
	GQL_TYPE_COUNT,
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	//GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH,
	GQL_TYPE_SYNONYM,
	GQL_TYPE_TOTAL,
	schemaGenerator
});

const {
	GQL_INTERFACE_NODE
} = generateInterfaces({
	// Common types
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	//GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH,

	// Specific types
	GQL_TYPE_COLLECTION,
	GQL_TYPE_DOCUMENT_TYPE,
	GQL_TYPE_FIELD_NODE,

	schemaGenerator
});

export const SCHEMA = createSchema({
	dictionary: [
		// Without this we get the Error: type Node not found in schema
		// But with this it seems we get: Cannot cast graphql.schema.GraphQLInterfaceType to graphql.schema.GraphQLObjectType
		GQL_INTERFACE_NODE
	],
	mutation: createObjectType({
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
	}), // mutation
	query: createObjectType({
		name: 'Query',
		fields: {
			getContentTypes: getContentTypesField,
			getLicense: generateGetLicenseField({
				schemaGenerator
			}),
			getLocales: generateGetLocalesField({
				schemaGenerator
			}),
			getDocumentType: getDocumentTypeField,
			getSites: generateGetSitesField({
				GQL_TYPE_COUNT,
				GQL_TYPE_ID,
				GQL_TYPE_NAME,
				//GQL_TYPE_NODE_TYPE,
				GQL_TYPE_PATH,
				GQL_TYPE_TOTAL,
				schemaGenerator
			}),
			listScheduledJobs: generateScheduledJobsListField({
				GQL_TYPE_JOB
			}),
			queryApiKeys: queryApiKeysField,
			queryCollections: queryCollectionsField,
			queryCollectors: generateQueryCollectorsField({
				schemaGenerator
			}),
			queryFields: queryFieldsField,
			queryInterfaces: generateQueryInterfacesField({
				GQL_TYPE_COUNT,
				GQL_TYPE_ID,
				GQL_TYPE_NAME,
				//GQL_TYPE_NODE_TYPE,
				GQL_TYPE_PATH,
				GQL_TYPE_TOTAL,
				schemaGenerator
			}),
			queryJournals: generateQueryJournalsField({
				GQL_TYPE_COUNT,
				GQL_TYPE_ID,
				GQL_TYPE_NAME,
				//GQL_TYPE_NODE_TYPE,
				GQL_TYPE_PATH,
				GQL_TYPE_TOTAL,
				schemaGenerator
			}),
			queryStopWords: generateQueryStopWordsField({
				GQL_TYPE_COUNT,
				GQL_TYPE_ID,
				GQL_TYPE_NAME,
				//GQL_TYPE_NODE_TYPE,
				GQL_TYPE_PATH,
				GQL_TYPE_TOTAL,
				schemaGenerator
			}),
			querySynonyms: querySynonymsField,
			queryDocumentTypes: queryDocumentTypesField,
			queryThesauri: queryThesauriField,
			queryTasks: generateListTasksField({
				schemaGenerator
			}),
			referencedBy: generateReferencedByField({
				GQL_TYPE_ID,
				GQL_TYPE_NAME,
				GQL_TYPE_NODE_TYPE,
				GQL_TYPE_PATH,
				schemaGenerator
			})
		} // fields
	}) // query
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
