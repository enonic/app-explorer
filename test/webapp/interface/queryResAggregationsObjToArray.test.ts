import {deepStrictEqual} from 'assert';
import {queryResAggregationsObjToArray} from '../../../src/main/resources/webapp/interface/schemaWithLimitedDocumentTypesAndFieldAutocompletion/queryResAggregationsObjToArray';


describe('webapp', () => {
	describe('interface', () => {
		describe('queryResAggregationsObjToArray', () => {
			it('handles nested buckets', () => {
				deepStrictEqual(
					[{
						name: 'languageTerms',
						type: 'AggregationTerms',
						buckets: [{
							docCount: 1,
							key: 'english',
							subAggregations: [{
								name: 'titleUnderLanguage',
								type: 'AggregationTerms',
								buckets: [{
									docCount: 1,
									key: 'whatever'
								}] // buckets
							}] // subAggregations
						}] // buckets
					},{
						name: 'titleTerms',
						type: 'AggregationTerms',
						buckets: [{
							docCount: 1,
							key: 'whatever'
						}] // buckets
					}],
					queryResAggregationsObjToArray<
						'languageTerms'|'titleTerms'|'titleUnderLanguage'
					>({
						obj: {
							languageTerms: {
									buckets: [
										{
											key: 'english',
											docCount: 1,
											titleUnderLanguage: {
												buckets: [
													{
														key: 'whatever',
														docCount: 1
													}
												]
											}
										}
									]
								},
								titleTerms: {
									buckets: [
										{
											key: 'whatever',
											docCount: 1
										}
									]
								}
						},
						types: {
							titleTerms: {
								type: 'terms'
							},
							languageTerms: {
								type: 'terms',
								types: {
									titleUnderLanguage: {
										type: 'terms'
									}
								}
							}
						}/*,
						localTypes: {
							titleTerms: {
								type: 'terms'
							},
							languageTerms: {
								type: 'terms',
								types: {
									titleUnderLanguage: {
										type: 'terms'
									}
								}
							}
						}*/
					})
				);
			}); // it
		}); // describe queryResAggregationsObjToArray
	}); // describe interface
}); // describe webapp
