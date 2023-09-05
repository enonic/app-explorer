// Rememeber that migrations should not depend on files that changes,
// or the migration may fail due to those changes.
import type {SynonymNode as SynonymNodeV1} from '/lib/explorer/synonym/Synonym_v1';
import type {SynonymNode as SynonymNodeV2} from '/lib/explorer/synonym/Synonym_v2';


import {
	addQueryFilter//,
	//toStr
} from '@enonic/js-utils';
import {
	NT_SYNONYM,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/constants';
import {constructProgress} from '/lib/explorer/task/constructProgress'
import {getThesaurus} from '/lib/explorer/thesaurus/getThesaurus'
import {query} from '/lib/explorer/node/query'
import {hasValue} from '/lib/explorer/query/hasValue'
import {connect} from '/lib/explorer/repo/connect';
import {migrateSynonymNode_v1_to_v2} from './migrateSynonymNode_v1_to_v2'


export function run({
	thesaurusId,
	fromLocale,
	toLocale
} :{
	thesaurusId: string
	fromLocale: string
	toLocale: string
}) {
	const progress = constructProgress({
		message: `Checking parameters`
	}).report()//.debug();

	if (!thesaurusId) {
		const msg = 'Missing required parameter thesaurusId!';
		progress.setMessage(msg).report().error();
		throw new Error(msg);
	}

	if (!fromLocale) {
		const msg = 'Missing required parameter fromLocale!';
		progress.setMessage(msg).report().error();
		throw new Error(msg);
	}

	if (!toLocale) {
		const msg = 'Missing required parameter toLocale!';
		progress.setMessage(msg).report().error();
		throw new Error(msg);
	}

	progress.finishItem().addItems(1).setMessage(`Getting thesaurus with id:${thesaurusId}`).report()//.debug();

	const explorerRepoWriteConnection = connect({
		principals:[PRINCIPAL_EXPLORER_WRITE]
	});

	let thesaurusNode: ReturnType<typeof getThesaurus>;
	try {
		thesaurusNode = getThesaurus({
			connection: explorerRepoWriteConnection,
			_id: thesaurusId
		});
	} catch (e) {
		progress.setMessage(e.message).report().error();
		throw e;
	}
	const {
		_name: thesaurusName,
		_path: thesaurusPath
	} = thesaurusNode

	progress.finishItem().addItems(1).setMessage(`Getting synonyms to migate in thesaurus ${thesaurusName}`).report()//.debug();
	const queryRes = query({
		connection: explorerRepoWriteConnection,
		count: -1,
		nodeTypes: [NT_SYNONYM],
		parentPaths: [thesaurusPath],
		filters: addQueryFilter({
			clause: 'mustNot',
			filter: hasValue('nodeTypeVersion', 2)
		})
	});
	//log.debug('queryRes:%s', toStr(queryRes));

	progress.finishItem().addItems(queryRes.count);

	for (let i = 0; i < queryRes.hits.length; i++) {
		const {id: synonymId} = queryRes.hits[i];
		progress.setMessage(`Migrating synonym with id:${synonymId}`).report()//.debug();
		try {
			//const migratedSynonymNode :SynonymNodeV2 =
			explorerRepoWriteConnection.modify<SynonymNodeV1>({
				key: synonymId,
				editor: (synonymNode_v1: SynonymNodeV1) => migrateSynonymNode_v1_to_v2({
					fromLocale,
					synonymNode_v1,
					thesaurusId,
					toLocale
				}) as unknown as SynonymNodeV1
			}) as unknown as SynonymNodeV2;
			//log.debug('migratedSynonymNode:%s', toStr(migratedSynonymNode));
		} catch (e) {
			progress.setMessage(e.message).report().error();
			throw e;
		}
		progress.finishItem();
	} // for queryRes.hits

	progress.setMessage(`Finished migrating thesaurus ${thesaurusName}`).report().debug();
} // run
