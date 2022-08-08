import type {InputTypeSynonymLanguage} from '/lib/explorer/types/Synonym.d';


import {
	isString,
	toStr
} from '@enonic/js-utils';
import {
	NT_SYNONYM,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/constants';
import {query} from '/lib/explorer/node/query';
import {parseCsv} from '/lib/explorer/parseCsv';
import {connect} from '/lib/explorer/repo/connect';
import {createSynonym} from '/lib/explorer/synonym/createSynonym';
import {query as querySynonyms} from '/lib/explorer/synonym/query';
import {constructProgress} from '/lib/explorer/task/constructProgress'
import {getThesaurus} from '/lib/explorer/thesaurus/getThesaurus'


export function run({
	csv,
	fromLocale,
	thesaurusId,
	toLocale
} :{
	csv :string
	fromLocale :string
	thesaurusId :string
	toLocale :string
}) {
	/*log.debug('csv:%s', csv);
	log.debug('fromLocale:%s', fromLocale);
	log.debug('thesaurusId:%s', thesaurusId);
	log.debug('toLocale:%s', toLocale);*/

	const progress = constructProgress({
		message: `Checking parameters`
	}).report()//.debug();

	if (!csv) {
		const msg = 'Missing required parameter csv!';
		progress.setMessage(msg).report().error();
		throw new Error(msg);
	}

	if (!fromLocale) {
		const msg = 'Missing required parameter fromLocale!';
		progress.setMessage(msg).report().error();
		throw new Error(msg);
	}

	if (!thesaurusId) {
		const msg = 'Missing required parameter thesaurusId!';
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

	let thesaurusNode :ReturnType<typeof getThesaurus>;
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
		_name: thesaurusName
	} = thesaurusNode
	//log.debug('thesaurusName:%s', thesaurusName);

	progress.finishItem().addItems(1).setMessage(`Getting existing synonymIds`).report()//.debug();

	const synonymsQueryRes = query({
		connection: explorerRepoWriteConnection,
		nodeTypes: [NT_SYNONYM],
		parentPaths: [thesaurusNode._path]
	});
	//log.debug('synonymsQueryRes:%s', toStr(synonymsQueryRes));

	const synonymIdsExisting = synonymsQueryRes.hits.map(({id}) => id);
	//log.debug('synonymIdsExisting:%s', toStr(synonymIdsExisting));

	progress.finishItem().addItems(1).setMessage(`Parsing csv`).report()//.debug();

	const parsedCsv :Array<{
		from ?:string
		to ?:string
	}> = parseCsv({
		csvString: csv,
		columns: ['from', 'to'],
		start: 1 // Aka skip line 0
	});

	progress.finishItem().addItems(parsedCsv.length).setMessage(`Processing csv lines`).report()//.debug();

	let errors = 0;
	let successes = 0;

	const synonymIdsCreated = [];
	const synonymIdsPossibleDuplicates :Record<string, Array<string>>= {};
	const synonymIdsPossibleDuplicatesArr = [];
	//const synonymIdsUpdated = [];
	const synonymIdsUntouched = [];

	for (let i = 0; i < parsedCsv.length; i++) {
		progress.setMessage(`Processing csv line:${i+1}`).report()//.debug();
		const {
			from,
			to
		} = parsedCsv[i];
		if (
			from // Skip empty cells
			&& to // Skip empty cells
			&& isString(from) && from.trim() // Skip cells with just whitespace, emptystring is Falsy
			&& isString(to) && to.trim() // Skip cells with just whitespace, emptystring is Falsy
		) { // Skip empty values
			const fromArr = from.trim().split(',').map(str => str.trim());
			const toArr = to.trim().split(',').map(str => str.trim());

			const bothArr = [];
			let cleanedFromArr = [];
			let cleanedToArr = [];
			if (fromLocale === toLocale) {

				for (let i = 0; i < fromArr.length; i++) {
					const aFromSynonym = fromArr[i];
					if (toArr.includes(aFromSynonym)) {
						bothArr.push(aFromSynonym);
					} else {
						cleanedFromArr.push(aFromSynonym);
					}
				} // for fromArr

				for (let i = 0; i < toArr.length; i++) {
					const aToSynonym = toArr[i];
					if (!bothArr.includes(aToSynonym)) {
						cleanedToArr.push(aToSynonym);
					}
				} // for toArr

			} else { //fromLocale !== toLocale
				cleanedFromArr = fromArr;
				cleanedToArr = toArr;
			} // if fromLocale === toLocale
			//log.debug('bothArr:%s', toStr(bothArr));
			//log.debug('cleanedFromArr:%s', toStr(cleanedFromArr));
			//log.debug('cleanedToArr:%s', toStr(cleanedToArr));

			const fromLanguageObject :InputTypeSynonymLanguage = {
				both: [],
				locale: fromLocale,
				from: [],
				to: []
			};
			const toLanguageObject = fromLocale === toLocale
				? fromLanguageObject
				: {
					both: [],
					locale: toLocale,
					from: [],
					to: []
				}

			const mustQueries = [];
			for (let i = 0; i < bothArr.length; i++) {
				const aBothSynonym = bothArr[i];
				mustQueries.push({
					term: {
						field: `languages.${fromLocale}.both.synonym`, // fromLocale === toLocale
						value: aBothSynonym
					}
				});
				fromLanguageObject.both.push({
					synonym: aBothSynonym
				});
			} // for bothArr

			for (let i = 0; i < cleanedFromArr.length; i++) {
				const aFromSynonym = cleanedFromArr[i];
				mustQueries.push({
					term: {
						field: `languages.${fromLocale}.from.synonym`,
						value: aFromSynonym
					}
				});
				fromLanguageObject.from.push({
					synonym: aFromSynonym
				});
			} // for cleanedFromArr

			for (let i = 0; i < cleanedToArr.length; i++) {
				const aToSynonym = cleanedToArr[i];
				mustQueries.push({
					term: {
						field: `languages.${toLocale}.to.synonym`,
						value: aToSynonym
					}
				});
				toLanguageObject.to.push({
					synonym: aToSynonym
				});
			} // for cleanedToArr

			const querySynonymsParams = {
				connection: explorerRepoWriteConnection,
				count: -1, // I want all possibleDuplicates
				query: {
					boolean: {
						must: mustQueries
					}
				}
			};
			//log.debug('querySynonymsParams:%s', toStr(querySynonymsParams));

			const querySynonymsRes = querySynonyms(querySynonymsParams);
			//log.debug('querySynonymsRes:%s', toStr(querySynonymsRes));

			if (querySynonymsRes.total === 1) {
				const {_id} = querySynonymsRes.hits[0];
				log.info(`Found a single matching synonym with _id:${_id}, not touching it.`);
				synonymIdsUntouched.push(_id);
			} else {
				const languages = [fromLanguageObject];
				if (fromLocale !== toLocale) {
					languages.push(toLanguageObject)
				}

				const createdSynoym = createSynonym({
					languages,
					thesaurusId: thesaurusNode._id,
					thesaurusName
				},{
					explorerRepoWriteConnection,
					checkInterfaceIds: false,
					checkThesaurus: false,
					refreshRepoIndexes: false
				});

				if (createdSynoym) {
					synonymIdsCreated.push(createdSynoym._id);
					successes += 1;
					if (querySynonymsRes.total > 1) {
						log.warning(`Found ${querySynonymsRes.total} matching synonyms, created one more.`);
						if (!synonymIdsPossibleDuplicates[createdSynoym._id]) {
							synonymIdsPossibleDuplicates[createdSynoym._id] = [];
						}
						for (let i = 0; i < querySynonymsRes.hits.length; i++) {
							const dupId = querySynonymsRes.hits[i]._id;
							if (!synonymIdsPossibleDuplicates[createdSynoym._id].includes(dupId)) {
								synonymIdsPossibleDuplicates[createdSynoym._id].push(dupId);
							}
							if (!synonymIdsPossibleDuplicatesArr.includes(dupId)) {
								synonymIdsPossibleDuplicatesArr.push(dupId);
							}
						} // for querySynonymsRes.hits
					}
				} else {
					log.error(`Unable to create synonym with languages:${toStr(languages)}`);
					errors += 1;
				}
			}
		}
		progress.finishItem();
	} // for parsedCsv
	explorerRepoWriteConnection.refresh();

	const notDeleted = [];
	for (let i = 0; i < synonymIdsExisting.length; i++) {
		const existingSynonymId = synonymIdsExisting[i];
		if (
			!synonymIdsUntouched.includes(existingSynonymId)
			&& !synonymIdsPossibleDuplicatesArr.includes(existingSynonymId)
		) {
			notDeleted.push(existingSynonymId);
		}
	}

	log.info(`Import to thesaurus id:%s name:%s state:%s`,thesaurusId, thesaurusName, toStr({
		errors,
		successes,
		synonymIds: {
			created: synonymIdsCreated,
			untouched: synonymIdsUntouched,
			possibleDuplicates: synonymIdsPossibleDuplicates,
			notDeleted,
			exisited: synonymIdsExisting
		}
	}));

	progress.setMessage(`Finished importing to thesaurus ${thesaurusName}`).report().debug();
}
