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
				} else if (['fulltext', 'ngram', 'synonyms'].includes(newType)) {
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
			value={type}
		/>
		{['fulltext', 'ngram', 'synonyms'].includes(type) && <Fulltext
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
		{type === 'range' && <Range
			disabled={disabled}
			fieldsObj={fieldsObj}
			path={paramsPath}
		/>}
		{type === 'pathMatch' && <PathMatch
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
