import type {InterfaceField} from '/lib/explorer/types/index.d';


import {
	QUERY_OPERATOR_AND,
	storage
} from '@enonic/js-utils';


const bool = storage.query.dsl.bool;
const fulltext = storage.query.dsl.fulltext;
const ngram = storage.query.dsl.ngram;
const or = storage.query.dsl.or;
const stemmed = storage.query.dsl.stemmed;


export function makeQuery({
	fields,
	searchStringWithoutStopWords
} :{
	fields :Array<InterfaceField>
	searchStringWithoutStopWords :string
}) {
	const query = bool(or(fulltext(
		fields.map(({boost, name: field}) => ({boost: (
			parseInt(boost as unknown as string) // In case there are some old interface nodes with boost as string rather than number
			||1) + (fields.length * 2), field})),
		searchStringWithoutStopWords,
		QUERY_OPERATOR_AND
	),stemmed(
		fields.map(({boost, name: field}) => ({boost: (
			parseInt(boost as unknown as string) // In case there are some old interface nodes with boost as string rather than number
			||1) + fields.length, field})),
		searchStringWithoutStopWords,
		QUERY_OPERATOR_AND,
		//language // TODO @enonic/js-utils defaults to english, which is why it works
	),ngram(
		fields.map(({boost, name: field}) => ({boost, field})),
		searchStringWithoutStopWords,
		QUERY_OPERATOR_AND
	)));
	return query;
}
