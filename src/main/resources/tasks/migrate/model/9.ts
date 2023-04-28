import type {
	RepoConnection,
	SynonymNode
} from '@enonic-types/lib-explorer';

import type {
	InterfaceNodeWithFacets,
	InterfaceNodeWithFilter,
	InterfaceNodeWithPagination,
	InterfaceNodeWithQuery,
	InterfaceNodeWithResultMappings,
	InterfaceNodeWithThesauri
} from '../types.d';


import {
	COLON_SIGN,
	addQueryFilter,
	dirname,
	forceArray,
	toStr
} from '@enonic/js-utils';
import {detailedDiff} from 'deep-object-diff';
import deepEqual from 'fast-deep-equal';

import {ignoreErrors} from '/lib/explorer/ignoreErrors';
import {
	APP_EXPLORER,
	NT_INTERFACE,
	NT_SYNONYM
} from '/lib/explorer/index';
import {get as getInterface} from '/lib/explorer/interface/get';
import {interfaceModel} from './9/interfaceModel';
import {setModel} from '/lib/explorer/model/setModel';
import {create} from '/lib/explorer/node/create';
import {hasValue} from '/lib/explorer/query/hasValue';

//@ts-ignore
import {reference} from '/lib/xp/value';

import {
	DEFAULT_INTERFACE,
	DEFAULT_INTERFACE_NAME
} from '../interfaceDefault';
import {Progress} from '../Progress';


export function model9({
	progress,
	writeConnection
} :{
	progress :Progress
	writeConnection :RepoConnection
}) {
	progress.addItems(1).setInfo('Finding interfaces which has filters, so they can be removed...').report().logInfo();
	const interfacesWithFilters = writeConnection.query({
		count: -1,
		filters: addQueryFilter({
			filter: { exists: { field: 'filters'}},
			filters: addQueryFilter({
				filter: hasValue('_nodeType', [NT_INTERFACE])
			})
		}),
		query: ''
	}).hits.map(({id}) => writeConnection.get<InterfaceNodeWithFilter>(id));
	//log.debug(`interfacesWithFilters:${toStr(interfacesWithFilters)}`);
	progress.finishItem();

	if (interfacesWithFilters) {
		progress.addItems(interfacesWithFilters.length);
		interfacesWithFilters.forEach(({_path}) => {
			progress.setInfo(`Removing filters from interface _path:${_path}`).report().logInfo();
			writeConnection.modify<InterfaceNodeWithFilter>({
				key: _path,
				editor: (interfaceNode) => {
					delete interfaceNode.filters;
					//log.debug(`interfaceNode with filters removed:${toStr(interfaceNode)}`);
					return interfaceNode;
				}
			});
			progress.finishItem();
		});
	}

	progress.addItems(1).setInfo('Finding interfaces which has a query, so it can be removed...').report().logInfo();
	const interfacesWithQuery = writeConnection.query({
		count: -1,
		filters: addQueryFilter({
			filter: { exists: { field: 'query'}},
			filters: addQueryFilter({
				filter: hasValue('_nodeType', [NT_INTERFACE])
			})
		}),
		query: ''
	}).hits.map(({id}) => writeConnection.get<InterfaceNodeWithQuery>(id));
	//log.debug(`interfacesWithQuery:${toStr(interfacesWithQuery)}`);
	progress.finishItem();

	if (interfacesWithQuery) {
		progress.addItems(interfacesWithQuery.length);
		interfacesWithQuery.forEach(({_path}) => {
			progress.setInfo(`Removing query from interface _path:${_path}`).report().logInfo();
			writeConnection.modify<InterfaceNodeWithQuery>({
				key: _path,
				editor: (interfaceNode) => {
					delete interfaceNode.query;
					//log.debug(`interfaceNode with query removed:${toStr(interfaceNode)}`);
					return interfaceNode;
				}
			});
			progress.finishItem();
		});
	}

	progress.addItems(1).setInfo('Finding interfaces which has resultMappings, so they can be removed...').report().logInfo();
	const interfacesWithResultMappings = writeConnection.query({
		count: -1,
		filters: addQueryFilter({
			filter: { exists: { field: 'resultMappings'}},
			filters: addQueryFilter({
				filter: hasValue('_nodeType', [NT_INTERFACE])
			})
		}),
		query: ''
	}).hits.map(({id}) => writeConnection.get<InterfaceNodeWithResultMappings>(id));
	//log.debug(`interfacesWithResultMappings:${toStr(interfacesWithResultMappings)}`);
	progress.finishItem();

	if (interfacesWithResultMappings) {
		progress.addItems(interfacesWithResultMappings.length);
		interfacesWithResultMappings.forEach(({_path}) => {
			progress.setInfo(`Removing resultMappings from interface _path:${_path}`).report().logInfo();
			writeConnection.modify<InterfaceNodeWithResultMappings>({
				key: _path,
				editor: (interfaceNode) => {
					delete interfaceNode.resultMappings;
					//log.debug(`interfaceNode with resultMappings removed:${toStr(interfaceNode)}`);
					return interfaceNode;
				}
			});
			progress.finishItem();
		});
	}

	progress.addItems(1).setInfo('Finding all interfaces so resultMappings can be removed from indexConfig...').report().logInfo();
	const allInterfaces = writeConnection.query({
		count: -1,
		filters: addQueryFilter({
			filter: hasValue('_nodeType', [NT_INTERFACE])
		}),
		query: ''
	}).hits.map(({id}) => writeConnection.get(id));
	//log.debug(`allInterfaces:${toStr(allInterfaces)}`);
	progress.finishItem();

	if (allInterfaces) {
		progress.addItems(allInterfaces.length);
		allInterfaces.forEach(({_indexConfig = {}, _path}) => {
			if (_indexConfig.configs) {
				const hasResultMappingsArray = forceArray(_indexConfig.configs).filter(({path: p}) => p === 'resultMappings*');
				//log.debug(`hasResultMappingsArray:${toStr(hasResultMappingsArray)}`);
				if (hasResultMappingsArray.length) {
					progress.setInfo(`Removing resultMappings from indexConfig of interface _path:${_path}`).report().logInfo();
					writeConnection.modify({
						key: _path,
						editor: (interfaceNode) => {
							interfaceNode._indexConfig.configs.forEach(({path}, i) => {
								if (path === 'resultMappings*') {
									//log.debug(`The index of the indexConfig with path 'resultMapping*' is:${toStr(i)} in inteface with _path:${_path}`);
									interfaceNode._indexConfig.configs.splice(i, 1);
								}
							});
							//log.debug(`interfaceNode with resultMappings removed from indexConfig:${toStr(interfaceNode)}`);
							return interfaceNode;
						}
					});
				}
			}
			progress.finishItem();
		});
	}

	progress.addItems(1).setInfo('Finding interfaces which has facets, so they can be removed...').report().logInfo();
	const interfacesWithFacets = writeConnection.query({
		count: -1,
		filters: addQueryFilter({
			filter: { exists: { field: 'facets'}},
			filters: addQueryFilter({
				filter: hasValue('_nodeType', [NT_INTERFACE])
			})
		}),
		query: ''
	}).hits.map(({id}) => writeConnection.get<InterfaceNodeWithFacets>(id));
	//log.debug(`interfacesWithFacets:${toStr(interfacesWithFacets)}`);
	progress.finishItem();

	if (interfacesWithFacets) {
		progress.addItems(interfacesWithFacets.length);
		interfacesWithFacets.forEach(({_path}) => {
			progress.setInfo(`Removing facets from interface _path:${_path}`).report().logInfo();
			writeConnection.modify<InterfaceNodeWithFacets>({
				key: _path,
				editor: (interfaceNode) => {
					delete interfaceNode.facets;
					//log.debug(`interfaceNode with facets removed:${toStr(interfaceNode)}`);
					return interfaceNode;
				}
			});
			progress.finishItem();
		});
	}

	progress.addItems(1).setInfo('Finding interfaces which has pagination, so they can be removed...').report().logInfo();
	const interfacesWithPagination = writeConnection.query({
		count: -1,
		filters: addQueryFilter({
			filter: { exists: { field: 'pagination'}},
			filters: addQueryFilter({
				filter: hasValue('_nodeType', [NT_INTERFACE])
			})
		}),
		query: ''
	}).hits.map(({id}) => writeConnection.get<InterfaceNodeWithPagination>(id));
	//log.debug(`interfacesWithPagination:${toStr(interfacesWithPagination)}`);
	progress.finishItem();

	if (interfacesWithPagination) {
		progress.addItems(interfacesWithPagination.length);
		interfacesWithPagination.forEach(({_path}) => {
			progress.setInfo(`Removing pagination from interface _path:${_path}`).report().logInfo();
			writeConnection.modify<InterfaceNodeWithPagination>({
				key: _path,
				editor: (interfaceNode) => {
					delete interfaceNode.pagination;
					//log.debug(`interfaceNode with pagination removed:${toStr(interfaceNode)}`);
					return interfaceNode;
				}
			});
			progress.finishItem();
		});
	}

	progress.addItems(1).setInfo('Finding interfaces which has thesauri, so they can be removed...').report().logInfo();
	const interfacesWithThesauri = writeConnection.query({
		count: -1,
		filters: addQueryFilter({
			filter: { exists: { field: 'thesauri'}},
			filters: addQueryFilter({
				filter: hasValue('_nodeType', [NT_INTERFACE])
			})
		}),
		query: ''
	}).hits.map(({id}) => writeConnection.get<InterfaceNodeWithThesauri>(id));
	//log.debug(`interfacesWithThesauri:${toStr(interfacesWithThesauri)}`);
	progress.finishItem();

	if (interfacesWithThesauri) {
		progress.addItems(interfacesWithThesauri.length);
		interfacesWithThesauri.forEach(({_path}) => {
			progress.setInfo(`Removing thesauri from interface _path:${_path}`).report().logInfo();
			writeConnection.modify<InterfaceNodeWithThesauri>({
				key: _path,
				editor: (interfaceNode) => {
					delete interfaceNode.thesauri;
					//log.debug(`interfaceNode with thesauri removed:${toStr(interfaceNode)}`);
					return interfaceNode;
				}
			});
			progress.finishItem();
		});
	}

	const NT_FIELD_VALUE = `${APP_EXPLORER}${COLON_SIGN}field-value`;
	progress.addItems(1).setInfo('Finding fieldValues so they can be deleted...').report().logInfo();
	const fieldValueIds = writeConnection.query({
		count: -1,
		filters: addQueryFilter({
			filter: hasValue('_nodeType', [NT_FIELD_VALUE])
		}),
		query: ''
	}).hits.map(({id}) => id);
	//log.debug(`fieldValueIds:${toStr(fieldValueIds)}`);
	progress.finishItem();

	if(fieldValueIds.length) {
		progress.addItems(1).setInfo(`Deleting ${fieldValueIds.length} fieldValues...`).report().logInfo();
		writeConnection.delete(fieldValueIds);
		progress.finishItem();
	}

	progress.addItems(1).setInfo('Creating/updating default interface...').report().logInfo();

	const existingInterfaceNode = getInterface({
		connection: writeConnection,
		interfaceName: DEFAULT_INTERFACE_NAME
	});
	//log.debug(`existingInterfaceNode:${toStr(existingInterfaceNode)}`);

	const interfaceParams = interfaceModel(DEFAULT_INTERFACE);
	//log.debug(`interfaceParams:${toStr(interfaceParams)}`);

	if(existingInterfaceNode) {
		const maybeChangedInterface = JSON.parse(JSON.stringify(existingInterfaceNode));
		delete interfaceParams._parentPath;
		Object.keys(interfaceParams).forEach((k) => {
			maybeChangedInterface[k] = interfaceParams[k];
		});
		//log.debug(`maybeChangedInterface:${toStr(maybeChangedInterface)}`);

		if (!deepEqual(existingInterfaceNode, maybeChangedInterface)) {
			interfaceParams.modifiedTime = new Date();
			maybeChangedInterface.modifiedTime = interfaceParams.modifiedTime;
			ignoreErrors(() => {
				log.info(`Changes detected, updating default interface. Diff:${toStr(detailedDiff(existingInterfaceNode, maybeChangedInterface))}`);
				writeConnection.modify({
					key: existingInterfaceNode._id,
					editor: (node) => {
						Object.keys(interfaceParams).forEach((k) => {
							node[k] = interfaceParams[k];
						});
						return node;
					}
				});
			});
		}
	} else {
		ignoreErrors(() => {
			create(interfaceParams, {
				connection: writeConnection
			}); // Should contain _parentPath
		});
	}
	progress.finishItem();

	progress.addItems(1).setInfo('Finding synonyms without thesaurusReference...').report().logInfo();
	const synonymsWithoutThesaurusReferenceParams = {
		//count: 2, // DEBUG
		count: -1,
		filters: addQueryFilter({
			filter: {
				notExists: { field: 'thesaurusReference'}
			},
			filters: addQueryFilter({
				filter: hasValue('_nodeType', [NT_SYNONYM])
			})
		}),
		query: ''
	};
	//log.debug(`synonymsWithoutThesaurusReferenceParams:${toStr(synonymsWithoutThesaurusReferenceParams)}`);
	const synonymsWithoutThesaurusReference = writeConnection
		.query(synonymsWithoutThesaurusReferenceParams)
		.hits.map(({id}) => writeConnection.get(id));
	//log.debug(`synonymsWithoutThesaurusReference:${toStr(synonymsWithoutThesaurusReference)}`);

	const thesaurusPathToId = {};

	progress.addItems(synonymsWithoutThesaurusReference.length);
	synonymsWithoutThesaurusReference.forEach(({_id, _path}) => {
		progress.addItems(1).setInfo(`Adding thesaurusReference to synonym _id:${_id}`).report().logInfo();
		const thesaurusPath = dirname(_path); //_path.match(/[^/]+/g)[1];
		//log.debug(`thesaurusPath:${toStr(thesaurusPath)}`);
		if (!thesaurusPathToId[thesaurusPath]) {
			const thesaurusNode = writeConnection.get(thesaurusPath);
			//log.debug(`thesaurusNode:${toStr(thesaurusNode)}`);
			thesaurusPathToId[thesaurusPath] = thesaurusNode._id;
			//log.debug(`thesaurusPathToId:${toStr(thesaurusPathToId)}`);
		}
		const thesaurusId = thesaurusPathToId[thesaurusPath];
		//log.debug(`thesaurusId:${toStr(thesaurusId)}`);
		//const synonymWithoutThesaurusModifyRes =
		writeConnection.modify<SynonymNode>({
			key: _id,
			editor: (node) => {
				node.thesaurusReference = reference(thesaurusId);
				return node;
			}
		});
		//log.debug(`synonymWithoutThesaurusModifyRes:${toStr(synonymWithoutThesaurusModifyRes)}`);
		progress.finishItem();
	});

	writeConnection.refresh();

	progress.finishItem();

	setModel({
		connection: writeConnection,
		version: 9
	});
}
