import type {WriteConnection} from '/lib/explorer/types/index.d';
import type {SynonymNodeSpecific} from './16/modifySynonymNodeEditor';


import {toStr} from '@enonic/js-utils';
import {setModel} from '/lib/explorer/model/setModel';
import {Progress} from '../Progress';
import {getSynonymsForThesaurusName} from './16/getSynonymsForThesaurusName';
import {getThesauri} from './16/getThesauri';
import {modifySynonymNodeEditor} from './16/modifySynonymNodeEditor';


export function model16({
	progress,
	writeConnection
} :{
	progress :Progress
	writeConnection :WriteConnection
}) {
	progress.addItems(1).setInfo('Get all thesauri to lookup language:{from , to}...').report().logInfo();
	const thesauri = getThesauri(writeConnection);
	log.debug('thesauri:%s', toStr(thesauri));
	progress.finishItem();

	progress.addItems(thesauri.length);
	for (let i = 0; i < thesauri.length; i++) {
	    const {
			thesaurusName,
			fromLanguage,
			toLanguage
		} = thesauri[i];
		progress.setInfo(`Processing thesaurus:${thesaurusName} fromLanguage:${fromLanguage} toLanguage:${toLanguage}...`).report().logInfo();
		// Query for synonym nodes that has from and to
		const synonyms = getSynonymsForThesaurusName({
			thesaurusName,
			writeConnection
		});
		log.debug('synonyms:%s', toStr(synonyms));

		progress.addItems(synonyms.length);
		for (let j = 0; j < synonyms.length; j++) {
		    const {
				id: synonymId
			} = synonyms[j];
			progress.setInfo(`Processing synonym id:${synonymId} fromLanguage:${fromLanguage} toLanguage:${toLanguage}...`).report().logInfo();
			writeConnection.modify<SynonymNodeSpecific>({
				key: synonymId,
				editor: (synonymNode) => modifySynonymNodeEditor({
					fromLanguage,
					synonymNode,
					toLanguage
				})
			});
			progress.finishItem();
		} // for synonyms
		progress.finishItem();
	} // for thesauri

	/*setModel({
		connection: writeConnection,
		version: 16
	});*/
}
