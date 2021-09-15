//import {toStr} from '@enonic/js-utils';

import {
	execute,
	newSchemaGenerator
} from '/lib/graphql';

import {RT_JSON} from '/lib/explorer/model/2/constants';

import {getContentTypes} from './contentType';
import {getLicense} from './license';
import {getSites} from './site';
import {getLocales} from './i18n';
import {queryApiKeys} from './apiKey';

import {
	fieldCollectionCreate,
	fieldCollectionUpdate,
	fieldCollectionsQuery,
	fieldCollectionsReindex
} from './collection';

import {queryCollectors} from './collector';
import {queryFields} from './field';
import {queryInterfaces} from './interface';
import {queryJournals} from './journal';
import {listScheduledJobs} from './scheduler';

import {
	fieldDocumentTypeCreate,
	fieldDocumentTypeDelete,
	fieldDocumentTypeGet,
	fieldDocumentTypesQuery,
	fieldDocumentTypeUpdate
} from './documentType';

import {queryStopWords} from './stopWord';

import {
	fieldSynonymCreate,
	fieldSynonymDelete,
	fieldSynonymsQuery,
	fieldSynonymUpdate
} from './synonym';

import {queryThesauri} from './thesaurus';
import {fieldThesaurusCreate} from './thesaurus/fieldThesaurusCreate';
import {fieldThesaurusDelete} from './thesaurus/fieldThesaurusDelete';
import {fieldThesaurusUpdate} from './thesaurus/fieldThesaurusUpdate';

import {
	fieldTaskQuery
} from './task';

const {
	createObjectType,
	createSchema
} = newSchemaGenerator();


export const SCHEMA = createSchema({
	mutation: createObjectType({
		name: 'Mutation',
		fields: {
			createCollection: fieldCollectionCreate,
			createDocumentType: fieldDocumentTypeCreate,
			createSynonym: fieldSynonymCreate,
			createThesaurus: fieldThesaurusCreate,

			deleteDocumentType: fieldDocumentTypeDelete,
			deleteSynonym: fieldSynonymDelete,
			deleteThesaurus: fieldThesaurusDelete,

			updateCollection: fieldCollectionUpdate,
			updateDocumentType: fieldDocumentTypeUpdate,
			updateSynonym: fieldSynonymUpdate,
			updateThesaurus: fieldThesaurusUpdate,

			reindexCollections: fieldCollectionsReindex
		}
	}), // mutation
	query: createObjectType({
		name: 'Query',
		fields: {
			getContentTypes,
			getLicense,
			getLocales,
			getDocumentType: fieldDocumentTypeGet,
			getSites,
			listScheduledJobs,
			queryApiKeys,
			queryCollections: fieldCollectionsQuery,
			queryCollectors,
			queryFields,
			queryInterfaces,
			queryJournals,
			queryStopWords,
			querySynonyms: fieldSynonymsQuery,
			queryDocumentTypes: fieldDocumentTypesQuery,
			queryThesauri,
			queryTasks: fieldTaskQuery
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

	const context = {};
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
