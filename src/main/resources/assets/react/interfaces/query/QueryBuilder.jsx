import getIn from 'get-value';
import {
	Dropdown as SemanticUiReactDropdown,
	Header,
	Segment
} from 'semantic-ui-react';

import {getEnonicContext} from '../../enonic/Context';
import {setValue} from '../../enonic/Form';

import {CompareExpression} from './CompareExpression';
import {Fulltext} from './Fulltext';
import {PathMatch} from './PathMatch';
import {Range} from './Range';


export function QueryBuilder(props) {
	const [context, dispatch] = getEnonicContext();

	const {
		fieldsObj,
		id,
		name = 'query',
		legend = null,
		parentPath,
		path = parentPath ? `${parentPath}.${name}` : name,
		thesauriOptions,
		value = getIn(context.values, path)
	} = props;
	//console.debug('QueryBuilder path', path, 'value', value);
	const type = getIn(value, 'type');
	//console.debug('QueryBuilder type', type);
	const paramsPath = `${path}.params`;
	const fragment = <>
		<SemanticUiReactDropdown
			onChange={(ignoredEvent,{value: newType}) => {
				let params;
				if(newType === 'group') {
					params = {
						expressions: [],
						operator: 'or'
					};
				} else if (['fulltext', 'ngram', 'synonyms'].includes(newType)) {
					params = {
						fields: [{
							field: '_allText',
							boost: ''//,
							//uuid4: generateUuidv4()
						}],
						operator: newType === 'synonyms' ? 'or' : 'and'
					};
					if (newType === 'synonyms') {
						params.thesauri = [];
					}
				} else if (newType === 'compareExpr') {
					params = {
						field: '',
						operator: '=',
						valueExpr: ''
					};
				} else if (newType === 'range') {
					params = {
						field: '',
						from : '',
						to: '',
						includeFrom: false,
						includeTo: false
					};
				} else if (newType === 'pathMatch') {
					params = {
						field: '',
						path: '',
						minMatch: 1
					};
				}
				dispatch(setValue({
					path,
					value: {
						type: newType,
						params
					}
				}));
			}}
			options={[{
				key: 'group',
				text: 'Logic',
				value: 'group'
			}, {
				key: 'fulltext',
				text: 'Fulltext',
				value: 'fulltext'
			}, {
				key: 'ngram',
				text: 'Ngram',
				value: 'ngram'
			}, {
				key: 'synonyms',
				text: 'Synonyms', // Fulltext Or
				value: 'synonyms'
			}, {
				key: 'compareExpr',
				text: 'Compare expression',
				value: 'compareExpr'
			}, {
				key: 'range',
				text: 'Range',
				value: 'range'
			}, {
				key: 'pathMatch',
				text: 'Path match',
				value: 'pathMatch'
			}]}
			path={`${path}.type`}
			placeholder='Please select expression type'
		/>
		{['fulltext', 'ngram', 'synonyms'].includes(type) && <Fulltext
			fieldsObj={fieldsObj}
			path={paramsPath}
			type={type}
			thesauriOptions={thesauriOptions}
		/>}
		{type === 'compareExpr' && <CompareExpression
			fieldsObj={fieldsObj}
			path={paramsPath}
		/>}
		{type === 'range' && <Range
			fieldsObj={fieldsObj}
			path={paramsPath}
		/>}
		{type === 'pathMatch' && <PathMatch
			fieldsObj={fieldsObj}
			path={paramsPath}
		/>}
	</>;
	if (parentPath) {
		return fragment;
	}
	return <>
		{legend ? <Header dividing id={id} text={legend}/> : null}
		<Segment>
			{fragment}
		</Segment>
	</>;
} // function QueryBuilder
