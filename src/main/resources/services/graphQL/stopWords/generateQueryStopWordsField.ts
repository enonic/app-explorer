//import {toStr} from '@enonic/js-utils';
import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query} from '/lib/explorer/stopWords/query';
//@ts-ignore
import {GraphQLInt} from '/lib/graphql';
import {GQL_TYPE_STOP_WORDS_QUERY_RESULT_NAME} from '../constants';


export  function generateQueryStopWordsField({
	glue
}) {
	return {
		args: {
			count: GraphQLInt
		},
		resolve: (env :{
			args: {
				count? :number
			}
		}) => {
			//log.info(`env:${toStr(env)}`);
			let {
				args: {
					count
				}
			} = env;
			const stopWordsRes = query({
				connection: connect({ principals: [PRINCIPAL_EXPLORER_READ] }),
				count // defaults to -1
			});
			//log.info(`stopWordsRes:${toStr(stopWordsRes)}`);
			return stopWordsRes;
		},
		type: glue.getObjectType(GQL_TYPE_STOP_WORDS_QUERY_RESULT_NAME)
	};
}
