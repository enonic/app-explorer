import type {Request} from '../../types/Request';


import {
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query as querySynonyms} from '/lib/explorer/synonym/query';


function getThesaurus({
	fromLanguage,
	name,
	toLanguage
} :{
	fromLanguage :string
	name :string
	toLanguage :string
}) {
	const connection = connect({
		principals: [PRINCIPAL_EXPLORER_READ]
	});
	const queryRes = querySynonyms({
		connection,
		count: -1,
		query: `_parentPath = '/thesauri/${name}'`,
	});
	const thesaurus = queryRes.hits.map(({
		//_id,
		languages
	}) => {
		const fromArray :Array<string>= [];
		const toArray :Array<string>= [];

		for (let i = 0; i < languages.length; i++) {
			const {both, from, locale, to} = languages[i];
			for (let j = 0; j < both.length; j++) {
				const {synonym} = both[j];
				if (locale === fromLanguage) {
					fromArray.push(synonym);
				}
				if (locale === toLanguage) {
					toArray.push(synonym);
				}
			}
			if (locale === fromLanguage) {
				for (let j = 0; j < from.length; j++) {
					const {synonym} = from[j];
					fromArray.push(synonym);
				}
			}
			if (locale === toLanguage) {
				for (let j = 0; j < to.length; j++) {
					const {synonym} = to[j];
					toArray.push(synonym);
				}
			}
		} // for languages

		if (fromArray.length && toArray.length) {
			return {
				from: fromArray, to: toArray
			};
		}
	}).filter((x) => x);
	return thesaurus;
}


export function get({
	params: {
		fromLanguage,
		name,
		toLanguage
	}
} :Request<{
	fromLanguage :string
	name :string
	toLanguage :string
}>) {
	const thesaurus = getThesaurus({
		fromLanguage,
		name,
		toLanguage
	});
	return {
		body: `"From","To"${thesaurus.map(s => `\n"${s.from.join(', ')}","${s.to.join(', ')}"`).join('')}\n`,
		contentType: 'text/csv;charset=utf-8',
		headers: {
			'Content-Disposition': `attachment; filename="${name}.csv"`
		}
	};
} // get
