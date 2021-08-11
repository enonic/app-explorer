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
	fieldCollectionsQuery
} from './collection';
import {queryCollectors} from './collector';
import {queryFields} from './field';
import {queryInterfaces} from './interface';
import {queryJournals} from './journal';
import {listScheduledJobs} from './scheduler';
import {
	fieldSchemaCreate,
	fieldSchemaDelete,
	fieldSchemaGet,
	fieldSchemaQuery,
	fieldSchemaUpdate
} from './schema';
import {queryStopWords} from './stopWord';
import {querySynonyms, queryThesauri} from './thesaurus';
import {queryTasks} from './task';

const {
	createObjectType,
	createSchema
} = newSchemaGenerator();


export const SCHEMA = createSchema({
	mutation: createObjectType({
		name: 'Mutation',
		fields: {
			createSchema: fieldSchemaCreate,
			deleteSchema: fieldSchemaDelete,
			updateSchema: fieldSchemaUpdate
		}
	}), // mutation
	query: createObjectType({
		name: 'Query',
		fields: {
			getContentTypes,
			getLicense,
			getLocales,
			getSchema: fieldSchemaGet,
			getSites,
			listScheduledJobs,
			queryApiKeys,
			queryCollections: fieldCollectionsQuery,
			queryCollectors,
			queryFields,
			queryInterfaces,
			queryJournals,
			queryStopWords,
			querySynonyms,
			querySchema: fieldSchemaQuery,
			queryThesauri,
			queryTasks
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
		body: execute(SCHEMA, query, variables, context)
	};
} // post
