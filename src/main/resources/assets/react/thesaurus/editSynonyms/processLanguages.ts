import type {HighlightResult} from '@enonic/js-utils/types/node/query/Highlight';
import type {Synonym_Language} from '@enonic-types/lib-explorer/Synonym';


export function processLanguages({
	_highlight,
	languagesArray,
	localeToStemmingLanguage
} :{
	_highlight :HighlightResult
	languagesArray :Array<Synonym_Language>
	localeToStemmingLanguage :Record<string,string>
}) {
	const synonymsObj :{
		both: Array<string>
		from: Array<string>
		to: Array<string>
	}= {
		both: [],
		from: [],
		to: []
	};
	for (let i = 0; i < (languagesArray as unknown as Array<Synonym_Language>).length; i++) {
		const {
			both,
			from,
			locale,
			to
		} = languagesArray[i] as Synonym_Language;
		for (let j = 0; j < both.length; j++) {
			const highlighted = _highlight[`languages.${locale}.both.synonym`];
			const highlightedStemmed = _highlight[`languages.${locale}.both.synonym._stemmed_${localeToStemmingLanguage[locale]}`]
			const {
				synonym
			} = both[j];
			const str = `${highlighted||highlightedStemmed||synonym} (${locale})`;
			if (!synonymsObj.both.includes(str)) {
				synonymsObj.both.push(str);
			}
		}
		for (let j = 0; j < from.length; j++) {
			const highlighted = _highlight[`languages.${locale}.from.synonym`];
			const highlightedStemmed = _highlight[`languages.${locale}.from.synonym._stemmed_${localeToStemmingLanguage[locale]}`]
			const {
				synonym
			} = from[j];
			const str = `${highlighted||highlightedStemmed||synonym} (${locale})`;
			if (!synonymsObj.from.includes(str)) {
				synonymsObj.from.push(str);
			}
		}
		for (let j = 0; j < to.length; j++) {
			const highlighted = _highlight[`languages.${locale}.to.synonym`];
			const highlightedStemmed = _highlight[`languages.${locale}.to.synonym._stemmed_${localeToStemmingLanguage[locale]}`]
			const {
				synonym
			} = to[j];
			const str = `${highlighted||highlightedStemmed||synonym} (${locale})`;
			if (!synonymsObj.to.includes(str)) {
				synonymsObj.to.push(str);
			}
		}
	} // for languagesArray
	return synonymsObj;
}
