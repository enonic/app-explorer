import {deepStrictEqual} from 'assert';
import {aggregationsArgToQueryParamAndTypes} from '../../../src/main/resources/webapp/interface/schemaWithLimitedDocumentTypes/aggregationsArgToQueryParamAndTypes';


describe('webapp', () => {
	describe('interface', () => {
		describe('aggregationsArgToQueryParamAndTypes', () => {
			it('handles two aggregations and subaggregation', () => {
				const camelToFieldObj = {};
				deepStrictEqual(
					{
						aggregations: {
							languageTerms: {
								aggregations: {
									titleUnderLanguage: {
										terms: {
											field: 'title'
										}
									}
								},
								terms: {
									field: 'language',
									size: 10
								}
							},
							titleTerms: {
								terms: {
									field: 'title',
									size: 10
								}
							},
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
						}
					},
					aggregationsArgToQueryParamAndTypes<
						'languageTerms'|'titleTerms'|'titleUnderLanguage'
					>({
						gqlSearchArgAggregationsArray: [
							{
							  name: 'languageTerms',
								subAggregations: [
									{
										name: 'titleUnderLanguage',
										terms: {
											field: 'title'
										}
									}
								],
								terms: {
								field: 'language',
								size: 10
							  }
							},
							{
								name: 'titleTerms',
								terms: {
									field: 'title',
									size: 10
								}
							},

						],
						camelToFieldObj
					})
				);
				//console.debug('camelToFieldObj', camelToFieldObj); // {}
			}); // it
		}); // describe aggregationsArgToQueryParamAndTypes
	}); // describe interface
}); // describe webapp
