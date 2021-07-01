import {
	QUERY_FUNCTION_FULLTEXT,
	QUERY_FUNCTION_NGRAM,
	QUERY_FUNCTION_RANGE,
	QUERY_FUNCTION_PATH_MATCH,
	QUERY_FUNCTION_STEMMED
} from '@enonic/sdk';

import getIn from 'get-value';
import {
	Dropdown as SemanticUiReactDropdown,
	Header,
	Icon,
	Segment
} from 'semantic-ui-react';

import {getEnonicContext} from 'semantic-ui-react-form/Context';
import {setValue} from 'semantic-ui-react-form/actions';
import {DeleteItemButton} from 'semantic-ui-react-form/buttons/DeleteItemButton';

import {CompareExpression} from './CompareExpression';
import {Fulltext} from './Fulltext';
import {Logic} from './Logic';
import {PathMatch} from './PathMatch';
import {Range} from './Range';
import {Stemmed} from './Stemmed';


export function QueryBuilder(props) {
	const [context, dispatch] = getEnonicContext();

	const {
		disabled = false,
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

	//console.debug('QueryBuilder fieldsObj', fieldsObj);
	const expandedFieldsObj = JSON.parse(JSON.stringify(fieldsObj));
	expandedFieldsObj['_allText'] = {
		text: '_allText'
	};
	//console.debug('QueryBuilder expandedFieldsObj', expandedFieldsObj);

	const type = getIn(value, 'type');
	//console.debug('QueryBuilder type', type);

	const paramsPath = `${path}.params`;
	const fragment = <>
		{parentPath && <DeleteItemButton
			disabled={disabled}
			basic compact icon floated='right'
			style={{
				boxShadow: 'none'
			}}
			index={name}
			path={parentPath}
		><Icon color='black' name='close'/></DeleteItemButton>}
		<SemanticUiReactDropdown
			disabled={disabled}
			onChange={(ignoredEvent,{value: newType}) => {
				let params;
				if(newType === 'group') {
					params = {
						expressions: [],
						operator: 'or'
					};
				} else if (newType === QUERY_FUNCTION_STEMMED) {
					params = {
						fields: [{
							field: '', // The _allText field doesn't suport stemming yet.
							boost: ''
						}],
						operator: 'and',
						language: ''
					};
				} else if ([
					QUERY_FUNCTION_FULLTEXT,
					QUERY_FUNCTION_NGRAM,
					'synonyms'
				].includes(newType)) {
					params = {
						fields: [{
							field: '_allText',
							boost: ''
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
				} else if (newType === QUERY_FUNCTION_RANGE) {
					params = {
						field: '',
						from : '',
						to: '',
						includeFrom: false,
						includeTo: false
					};
				} else if (newType === QUERY_FUNCTION_PATH_MATCH) {
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
				key: QUERY_FUNCTION_STEMMED,
				text: 'Stemmed',
				value: QUERY_FUNCTION_STEMMED
			}, {
				key: QUERY_FUNCTION_FULLTEXT,
				text: 'Fulltext',
				value: QUERY_FUNCTION_FULLTEXT
			}, {
				key: QUERY_FUNCTION_NGRAM,
				text: 'Ngram',
				value: QUERY_FUNCTION_NGRAM
			}, {
				key: 'synonyms',
				text: 'Synonyms', // Fulltext Or
				value: 'synonyms'
			}, {
				key: 'compareExpr',
				text: 'Compare expression',
				value: 'compareExpr'
			}, {
				key: QUERY_FUNCTION_RANGE,
				text: 'Range',
				value: QUERY_FUNCTION_RANGE
			}, {
				key: QUERY_FUNCTION_PATH_MATCH,
				text: 'Path match',
				value: QUERY_FUNCTION_PATH_MATCH
			}]}
			path={`${path}.type`}
			placeholder='Please select expression type'
			value={type}
		/>
		{type === QUERY_FUNCTION_STEMMED && <Stemmed
			disabled={disabled}
			fieldsObj={expandedFieldsObj}
			path={paramsPath}
		/>}
		{[
			QUERY_FUNCTION_FULLTEXT,
			QUERY_FUNCTION_NGRAM,
			'synonyms'
		].includes(type) && <Fulltext
			disabled={disabled}
			fieldsObj={expandedFieldsObj}
			path={paramsPath}
			type={type}
			thesauriOptions={thesauriOptions}
		/>}
		{type === 'group' && <Logic
			disabled={disabled}
			fieldsObj={expandedFieldsObj}
			path={paramsPath}
			thesauriOptions={thesauriOptions}
		/>}
		{type === 'compareExpr' && <CompareExpression
			disabled={disabled}
			fieldsObj={fieldsObj}
			path={paramsPath}
		/>}
		{type === QUERY_FUNCTION_RANGE && <Range
			disabled={disabled}
			fieldsObj={fieldsObj}
			path={paramsPath}
		/>}
		{type === QUERY_FUNCTION_PATH_MATCH && <PathMatch
			disabled={disabled}
			fieldsObj={fieldsObj}
			path={paramsPath}
		/>}
	</>;
	if (parentPath) {
		return fragment;
	}
	return <>
		{legend && <Header dividing id={id} content={legend}/>}
		<Segment>
			{fragment}
		</Segment>
	</>;
} // function QueryBuilder
