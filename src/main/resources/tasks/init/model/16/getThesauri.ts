import type {WriteConnection} from '/lib/explorer/types/index.d';


import {NT_THESAURUS} from '/lib/explorer/constants';


export function getThesauri(writeConnection :WriteConnection) {
	return writeConnection.query({
		count: -1,
		filters: {
			boolean: {
				should: [{
					exists: {
						field: 'language.from'
					}
				},{
					exists: {
						field: 'language.to'
					}
				}]
			}
		},
		query: {
			boolean: {
				must: [{
					term: {
						field: '_nodeType',
						value: NT_THESAURUS
					}
				},{
					term: {
						field: '_parentPath',
						value: '/thesauri'
					}
				}]
			}
		},
		sort: null
	}).hits
		.map(({id}) => writeConnection.get<{
			language :{
				from :string
				to :string
			}
		}>(id))
		.map(({
			_name: thesaurusName,
			language: {
				from: fromLanguage,
				to: toLanguage
			} = {}
		}) => ({
			thesaurusName,
			fromLanguage,
			toLanguage
		}));
}
