import {
	QUERY_OPERATOR_AND,
	/*fulltext,
	//group,
	or,
	ngram,
	stemmed*/
	storage
} from '@enonic/js-utils';

const bool = storage.query.dsl.bool;
const fulltext = storage.query.dsl.fulltext;
const ngram = storage.query.dsl.ngram;
const or = storage.query.dsl.or;
const stemmed = storage.query.dsl.stemmed;


export function buildQuery({
	fields,
	searchStringWithoutStopWords
}) {
	//`fulltext('${fields.map(({name: field, boost = 1}) => `${field}${boost && boost > 1 ? `^${boost}` : ''}`)}', '${searchStringWithoutStopWords}', 'AND')`,
	const query = bool(or(fulltext(
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
	)));
	//log.debug(`query:${toStr({query})}`);
	return query;
}
