import {QUERY_OPERATOR_AND} from '@enonic/js-utils';


interface QueryExpressionFulltext {
	fulltext :{
		fields :ReadonlyArray<string>
		operator :string
		query :string
	}
};

interface QueryExpressionNgram {
	ngram :{
		fields :ReadonlyArray<string>
		operator :string
		query :string
	}
};

interface QueryExpressionStemmed {
	stemmed :{
		fields :ReadonlyArray<string>
		language :string
		operator :string
		query :string
	}
};

type QueryExpression = Partial<QueryExpressionFulltext>
	& Partial<QueryExpressionNgram>
	& Partial<QueryExpressionStemmed>;

type OneOrMore<T> = T | T[];

interface CompoundExpression {
	must? :OneOrMore<QueryExpression> & CompoundExpression
	mustNot? :OneOrMore<QueryExpression> & CompoundExpression
	should? :OneOrMore<QueryExpression> & CompoundExpression
}

interface CompoundExpressionBoolean {
	boolean :CompoundExpression;
}

type QueryDSL = CompoundExpressionBoolean & QueryExpression;


export function buildQueryDSL({
	fields,
	searchStringWithoutStopWords
} :{
	fields :Array<{
		boost? :string
		name :string
	}>
	searchStringWithoutStopWords :string
}) :QueryDSL {
	return {
		boolean: {
			should: {
				fulltext: {
					fields: fields.map(({boost, name: field}) => `${field}^${
						(parseInt(boost)||1)
						+ (fields.length*2)
					}`),
					operator: QUERY_OPERATOR_AND,
					query: searchStringWithoutStopWords
				},
				stemmed: {
					fields: fields.map(({boost, name: field}) => `${field}^${
						(parseInt(boost)||1)
						+ (fields.length)
					}`),
					language: 'en', // TODO Hardcode
					operator: QUERY_OPERATOR_AND,
					query: searchStringWithoutStopWords
				},
				ngram: {
					fields: fields.map(({boost, name: field}) => `${field}^${
						(parseInt(boost)||1)
					}`),
					operator: QUERY_OPERATOR_AND,
					query: searchStringWithoutStopWords
				}
			}
		}
	};
}
