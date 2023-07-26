/*
mapping.api.host = localhost
mapping.api.source = /api
mapping.api.target = /webapp/com.enonic.app.explorer/api
mapping.api.idProvider.system = default
*/

import type {EnonicXpRequest} from '@enonic-types/lib-explorer';
import type {InterfaceRequest} from './interface/post';


import '@enonic/nashorn-polyfills';
//@ts-ignore
import Router from '/lib/router';
import {
	createOrUpdateMany,
	deleteOne,
	deleteMany,
	documentation,
	getMany,
	getOne,
	patch,
	put,
	query
} from './documents';
import {
	post as interfacePost
} from './interface';


const DOCUMENT_REST_API_VERSION = 'v2';

const router = Router();

router.post('/api/graphql', (r: InterfaceRequest) => interfacePost(r));
router.post('/api/graphql/', (r: InterfaceRequest) => interfacePost(r));
//router.all('/api/graphql', (r :InterfaceRequest) => listInterfaces(r)); // TODO GraphiQL instead

//──────────────────────────────────────────────────────────────────────────────
// Batch/Bulk/Many
//──────────────────────────────────────────────────────────────────────────────

router.delete(`/api/${DOCUMENT_REST_API_VERSION}/documents/{collectionName}`, (r: EnonicXpRequest) => deleteMany(r));
router.delete(`/api/${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/`, (r: EnonicXpRequest) => deleteMany(r));

router.get(`/api/${DOCUMENT_REST_API_VERSION}/documents/{collectionName}`, (r: EnonicXpRequest) => getMany(r));
router.get(`/api/${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/`, (r: EnonicXpRequest) => getMany(r));

router.post(`/api/${DOCUMENT_REST_API_VERSION}/documents/{collectionName}`, (r: EnonicXpRequest) => createOrUpdateMany(r));
router.post(`/api/${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/`, (r: EnonicXpRequest) => createOrUpdateMany(r));

router.post(`/api/${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/query`, (r: EnonicXpRequest) => query(r));
router.post(`/api/${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/query/`, (r: EnonicXpRequest) => query(r));

//──────────────────────────────────────────────────────────────────────────────
// One/Single
//──────────────────────────────────────────────────────────────────────────────
router.delete(`/api/${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/{documentId}`, (r: EnonicXpRequest) => deleteOne(r));
router.delete(`/api/${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/{documentId}/`, (r: EnonicXpRequest) => deleteOne(r));

router.get(`/api/${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/{documentId}`, (r: EnonicXpRequest) => getOne(r));
router.get(`/api/${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/{documentId}/`, (r: EnonicXpRequest) => getOne(r));

router.put(`/api/${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/{documentId}`, (r: EnonicXpRequest) => put(r));
router.put(`/api/${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/{documentId}/`, (r: EnonicXpRequest) => put(r));

// Method PATCH isn't part of the HTTP/1.1 standard.
// It is supported by some frameworks, but currently NOT Enonic XP, NOR lib-router:
// https://github.com/enonic/xp/issues/9131
// https://github.com/enonic/lib-router/issues/108
router.post(`/api/${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/{documentId}`, (r: EnonicXpRequest) => patch(r));
router.post(`/api/${DOCUMENT_REST_API_VERSION}/documents/{collectionName}/{documentId}/`, (r: EnonicXpRequest) => patch(r));

//──────────────────────────────────────────────────────────────────────────────
// Documentation
//──────────────────────────────────────────────────────────────────────────────
router.get(`/api/${DOCUMENT_REST_API_VERSION}/documents`, (r: EnonicXpRequest) => documentation(r));
router.get(`/api/${DOCUMENT_REST_API_VERSION}/documents/`, (r: EnonicXpRequest) => documentation(r));

export const all = (r: EnonicXpRequest) => router.dispatch(r);
