import {
	QUERY_OPERATOR_AND,
	fulltext,
	//group,
	or,
	ngram,
	stemmed
} from '@enonic/js-utils';


export function buildQuery({
	fields,
	searchStringWithoutStopWords
}) {
	//`fulltext('${fields.map(({name: field, boost = 1}) => `${field}${boost && boost > 1 ? `^${boost}` : ''}`)}', '${searchStringWithoutStopWords}', 'AND')`,
	const query = or(fulltext(
		fields.map(({boost, name: field}) => ({boost: (parseInt(boost)||1) + (fields.length*2), field})),
		searchStringWithoutStopWords,
		QUERY_OPERATOR_AND
	),stemmed(
		fields.map(({boost, name: field}) => ({boost: (parseInt(boost)||1) + fields.length, field})),
		searchStringWithoutStopWords,
		QUERY_OPERATOR_AND,
		//language // TODO @enonic/js-utils defaults to english, which is why it works
	),ngram(
		fields.map(({boost, name: field}) => ({boost, field})),
		searchStringWithoutStopWords,
		QUERY_OPERATOR_AND
	));
	//log.debug(`query:${toStr({query})}`);
	return query;
}
