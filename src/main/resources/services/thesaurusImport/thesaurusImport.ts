import type {InputTypeSynonymLanguage} from '/lib/explorer/types/Synonym.d';
import type {Request} from '../../types/Request';


import {
	RESPONSE_TYPE_JSON,
	isString,
	toStr
} from '@enonic/js-utils';
//@ts-ignore
import {getMultipartText} from '/lib/xp/portal';
import {
	NT_SYNONYM,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/constants';
import {connect} from '/lib/explorer/repo/connect';
//import {createOrModify} from '/lib/explorer/node/createOrModify';
//import {synonym} from '/lib/explorer/model/2/nodeTypes/synonym';
import {parseCsv} from '/lib/explorer/parseCsv';
import {query} from '/lib/explorer/node/query';
import {createSynonym} from '/lib/explorer/synonym/createSynonym';
import {query as querySynonyms} from '/lib/explorer/synonym/query';
//import {updateSynonym} from '/lib/explorer/synonym/updateSynonym';
import {getThesaurus} from '/lib/explorer/thesaurus/getThesaurus';


function jsonResponse(body = {}, status = 500) {
	return {
		body,
		contentType: RESPONSE_TYPE_JSON,
		status
	}
}


function badRequestJsonResponse(error :string) {
	return jsonResponse({error}, 400);
}


/*function internalServerErrorJsonResponse(error ?:string) {
	return jsonResponse({error}, 500);
}*/


export function post(request :Request<{
	fromLanguage :string
	thesaurusName :string
	toLanguage :string
}>) {
	//log.debug('request:%s', toStr(request));
	const {
		params: {
			fromLanguage,
			thesaurusName,
			toLanguage
		}
	} = request;
	if (!fromLanguage) {
		return badRequestJsonResponse('Missing required parameter fromLanguage!');
	}
	if (!thesaurusName) {
		return badRequestJsonResponse('Missing required parameter thesaurusName!');
	}
	if (!toLanguage) {
		return badRequestJsonResponse('Missing required parameter toLanguage!');
	}
	//log.debug('fromLanguage:%s toLanguage:%s', fromLanguage, toLanguage);

	const explorerRepoWriteConnection = connect({
		principals: [PRINCIPAL_EXPLORER_WRITE]
	});

	const thesaurusNode = getThesaurus({ // Will throw on error
		connection: explorerRepoWriteConnection,
		_name: thesaurusName
	});

	const synonymsQueryRes = query({
		connection: explorerRepoWriteConnection,
		nodeTypes: [NT_SYNONYM],
		parentPaths: [thesaurusNode._path]
	});
	//log.debug('synonymsQueryRes:%s', toStr(synonymsQueryRes));

	const synonymIdsExisting = synonymsQueryRes.hits.map(({id}) => id);
	//log.debug('synonymIdsExisting:%s', toStr(synonymIdsExisting));

	const text :string = getMultipartText('file');
	let errors = 0;
	let successes = 0;

	const synonymIdsCreated = [];
	const synonymIdsPossibleDuplicates :Record<string, Array<string>>= {};
	const synonymIdsPossibleDuplicatesArr = [];
	//const synonymIdsUpdated = [];
	const synonymIdsUntouched = [];

	parseCsv({
		csvString: text,
		columns: ['from', 'to'],
		start: 1 // Aka skip line 0
	}).forEach(({
		from,
		to
	} :{
		from ?:string
		to ?:string
	}) => {
		//log.info(toStr({from, to}));
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
			if (fromLanguage === toLanguage) {

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

			} else { //fromLanguage !== toLanguage
				cleanedFromArr = fromArr;
				cleanedToArr = toArr;
			} // if fromLanguage === toLanguage
			//log.debug('bothArr:%s', toStr(bothArr));
			//log.debug('cleanedFromArr:%s', toStr(cleanedFromArr));
			//log.debug('cleanedToArr:%s', toStr(cleanedToArr));

			const fromLanguageObject :InputTypeSynonymLanguage = {
				both: [],
				locale: fromLanguage,
				from: [],
				to: []
			};
			const toLanguageObject = fromLanguage === toLanguage
				? fromLanguageObject
				: {
					both: [],
					locale: toLanguage,
					from: [],
					to: []
				}

			const mustQueries = [];
			for (let i = 0; i < bothArr.length; i++) {
				const aBothSynonym = bothArr[i];
				mustQueries.push({
					term: {
						field: `languages.${fromLanguage}.both.synonym`, // fromLanguage === toLanguage
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
						field: `languages.${fromLanguage}.from.synonym`,
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
						field: `languages.${toLanguage}.to.synonym`,
						value: aToSynonym
					}
				});
				toLanguageObject.from.push({
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
				if (fromLanguage !== toLanguage) {
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
	});
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

	const body :{
		error ?:string
		errors :number
		message ?:string
		successes :number
		synonymIds :{
			created: Array<string>
			untouched: Array<string>
			possibleDuplicates: Record<string, Array<string>>
			notDeleted: Array<string>
			exisited: Array<string>
		}
	} = {
		errors,
		successes,
		synonymIds: {
			created: synonymIdsCreated,
			untouched: synonymIdsUntouched,
			possibleDuplicates: synonymIdsPossibleDuplicates,
			notDeleted,
			exisited: synonymIdsExisting
		}
	};
	let status = 200;
	if (errors) {
		body.error = `There were ${errors} error(s) while importing to thesaurus ${thesaurusName}!`;
		status = 500;
	} else {
		body.message = `Imported ${successes} synonym(s) to thesaurus ${thesaurusName}`;
	}
	return jsonResponse(body, status);
} // post
