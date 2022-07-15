import type {
	OneOrMore,
	RequiredNodeProperties
} from '/lib/explorer/types/index.d';


import {
	forceArray,
	isSet,
	sortByProperty,
	sortKeys,
	updateIndexConfigs//,
	//toStr
} from '@enonic/js-utils';


type SynonymItem = {
	comment ?:string
	enabled ?:boolean
	synonym :string
}

export type SynonymNodeSpecific = {
	comment ?:string
	enabled ?:boolean
	from ?:OneOrMore<string> // Optional since it's going to be removed
	languages ?:Record<string,{ // Optional since it's going to be added
		comment ?:string
		enabled ?:boolean
		synonyms :OneOrMore<SynonymItem>
	}>
	thesaurusReference :string
	to ?:OneOrMore<string> // Optional since it's going to be removed
};


export function modifySynonymNodeEditor({
	fromLanguage,
	synonymNode,
	toLanguage
} :{
	fromLanguage :string
	synonymNode :RequiredNodeProperties & SynonymNodeSpecific
	toLanguage :string
}) {
	//@ts-ignore
	synonymNode._indexConfig.configs = updateIndexConfigs({
		configs: synonymNode._indexConfig.configs || [],
		updates: [{
			config: {
				decideByType: false,
				enabled: true,
				fulltext: true,
				includeInAllText: false,
				indexValueProcessors: [],
				languages: [],
				nGram: true,
				path: false
			},
			path: 'comment'
		}]
	});

	if (!isSet(synonymNode.enabled)) {
		synonymNode.enabled = true;
	}

	if (!synonymNode.languages) {
		synonymNode.languages = {};
	}

	if (fromLanguage) {
		//@ts-ignore
		synonymNode._indexConfig.configs = updateIndexConfigs({
			configs: synonymNode._indexConfig.configs || [],
			updates: [{
				config: {
					decideByType: false,
					enabled: true,
					fulltext: true,
					includeInAllText: false,
					indexValueProcessors: [],
					languages: [fromLanguage], // TODO Use stem language
					nGram: true,
					path: false
				},
				path: `languages.${fromLanguage}` // TODO Use stem language
			},{
				config: {
					decideByType: false,
					enabled: true,
					fulltext: true,
					includeInAllText: false,
					indexValueProcessors: [],
					languages: [],
					nGram: true,
					path: false
				},
				path: `languages.${fromLanguage}.comment`
			},{
				config: {
					decideByType: false,
					enabled: true,
					fulltext: true,
					includeInAllText: false,
					indexValueProcessors: [],
					languages: [],
					nGram: true,
					path: false
				},
				path: `languages.${fromLanguage}.synonyms.comment`
			}]
		});
		if (!synonymNode.languages[fromLanguage]) {
			synonymNode.languages[fromLanguage] = {
				//comment: '',
				enabled: true,
				synonyms: []
			};
		}

		if (!synonymNode.languages[fromLanguage].synonyms) {
			synonymNode.languages[fromLanguage].synonyms = [];
		}

		if (!Array.isArray(synonymNode.languages[fromLanguage].synonyms)) {
			synonymNode.languages[fromLanguage].synonyms = forceArray(synonymNode.languages[fromLanguage].synonyms);
		}

		const synonymsInFromLanguage = {}
		for (let i = 0; i < (synonymNode.languages[fromLanguage].synonyms as Array<SynonymItem>).length; i++) {
			const {synonym} = synonymNode.languages[fromLanguage].synonyms[i];
			synonymsInFromLanguage[synonym] = true;
		}

		if (synonymNode.from) {
			const fromArray = forceArray(synonymNode.from);
			for (let i = 0; i < fromArray.length; i++) {
				const synonym = fromArray[i];
				if (!synonymsInFromLanguage[synonym]) {
					(synonymNode.languages[fromLanguage].synonyms as Array<SynonymItem>).push({
						//comment: '',
						enabled: true,
						synonym
					});
				}
			}
		} // if from

		synonymNode.languages[fromLanguage].synonyms = sortByProperty(synonymNode.languages[fromLanguage].synonyms as Array<SynonymItem>, 'synonym');
	} // if fromLanguage


	if (toLanguage) {
		//@ts-ignore
		synonymNode._indexConfig.configs = updateIndexConfigs({
			configs: synonymNode._indexConfig.configs || [],
			updates: [{
				config: {
					decideByType: false,
					enabled: true,
					fulltext: true,
					includeInAllText: false,
					indexValueProcessors: [],
					languages: [toLanguage], // TODO Use stem language
					nGram: true,
					path: false
				},
				path: `languages.${toLanguage}` // TODO Use stem language
			},{
				config: {
					decideByType: false,
					enabled: true,
					fulltext: true,
					includeInAllText: false,
					indexValueProcessors: [],
					languages: [],
					nGram: true,
					path: false
				},
				path: `languages.${toLanguage}.comment`
			},{
				config: {
					decideByType: false,
					enabled: true,
					fulltext: true,
					includeInAllText: false,
					indexValueProcessors: [],
					languages: [],
					nGram: true,
					path: false
				},
				path: `languages.${toLanguage}.synonyms.comment`
			}]
		});
		if (!synonymNode.languages[toLanguage]) {
			synonymNode.languages[toLanguage] = {
				//comment: '',
				enabled: true,
				synonyms: []
			};
		}

		if (!synonymNode.languages[toLanguage].synonyms) {
			synonymNode.languages[toLanguage].synonyms = [];
		}

		if (!Array.isArray(synonymNode.languages[toLanguage].synonyms)) {
			synonymNode.languages[toLanguage].synonyms = forceArray(synonymNode.languages[toLanguage].synonyms);
		}

		// NOTE: fromLanguage and toLanguage might be the same language.
		// Processing them in order avoids duplicates.
		const synonymsInToLanguage = {}
		for (let i = 0; i < (synonymNode.languages[toLanguage].synonyms as Array<SynonymItem>).length; i++) {
			const {synonym} = synonymNode.languages[toLanguage].synonyms[i];
			synonymsInToLanguage[synonym] = true;
		}

		if (synonymNode.to) {
			const toArray = forceArray(synonymNode.to);
			for (let i = 0; i < toArray.length; i++) {
				const synonym = toArray[i];
				if (!synonymsInToLanguage[synonym]) {
					(synonymNode.languages[toLanguage].synonyms as Array<SynonymItem>).push({
						//comment: '',
						enabled: true,
						synonym
					});
				}
			}
		} // if from
		synonymNode.languages[toLanguage].synonyms = sortByProperty(synonymNode.languages[toLanguage].synonyms as Array<SynonymItem>, 'synonym');
	} // if toLanguage

	if (synonymNode.languages) {
		synonymNode.languages = sortKeys(synonymNode.languages);
	}
	synonymNode = sortKeys(synonymNode);

	return synonymNode as RequiredNodeProperties & SynonymNodeSpecific;
}
