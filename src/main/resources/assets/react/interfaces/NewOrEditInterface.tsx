import type {DropdownItemProps} from 'semantic-ui-react/index.d';
import type {InterfaceNamesObj} from './index.d';


//import {toStr} from '@enonic/js-utils';
import * as React from 'react';
import {
	Button,
	Form,
	Header,
	Icon,
	Loader,
	Modal
} from 'semantic-ui-react';

//@ts-ignore
import {Form as EnonicForm} from 'semantic-ui-react-form/Form';
//@ts-ignore
import {Dropdown} from 'semantic-ui-react-form/inputs/Dropdown';
//@ts-ignore
import {Input} from 'semantic-ui-react-form/inputs/Input';
//@ts-ignore
import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
//@ts-ignore
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';

import {DEFAULT_INTERFACE_FIELDS} from '../../../constants';
import {fetchInterfaceCreate} from '../../../services/graphQL/fetchers/fetchInterfaceCreate';
import {fetchInterfaceGet} from '../../../services/graphQL/fetchers/fetchInterfaceGet';
import {fetchInterfaceUpdate} from '../../../services/graphQL/fetchers/fetchInterfaceUpdate';
import {mustStartWithALowercaseLetter} from '../utils/mustStartWithALowercaseLetter';
import {notDoubleUnderscore} from '../utils/notDoubleUnderscore';
import {onlyLowercaseAsciiLettersDigitsAndUnderscores} from '../utils/onlyLowercaseAsciiLettersDigitsAndUnderscores';
import {required} from '../utils/required';
import {FieldSelector} from './FieldSelector';


type NewOrEditInterfaceProps = {
	_id? :string
	collectionIdToFieldKeys :{}
	collectionOptions :Array<DropdownItemProps>
	doClose :() => void
	globalFieldsObj :Record<string, boolean>
	interfaceNamesObj :InterfaceNamesObj
	servicesBaseUrl :string
	stopWordOptions :Array<DropdownItemProps>
	thesauriOptions :Array<DropdownItemProps>
}


export function NewOrEditInterface(props :NewOrEditInterfaceProps) {
	const {
		_id, // nullable
		collectionIdToFieldKeys = {},
		collectionOptions = [],
		doClose = () => {/**/},
		globalFieldsObj = {
			'_allText': true // TODO Hardcode
		},
		interfaceNamesObj = {},
		servicesBaseUrl,
		stopWordOptions,
		thesauriOptions
	} = props;
	//console.debug('NewOrEditInterface collectionOptions', collectionOptions);
	//console.debug('NewOrEditInterface stopWordOptions', stopWordOptions);
	//console.debug('NewOrEditInterface thesauriOptions', thesauriOptions);

	//const [isLoading, setLoading] = React.useState(!!id);
	const [state, setState] = React.useState({
		initialValues: {
			_name: '',
			collectionIds: [],
			fields: DEFAULT_INTERFACE_FIELDS,
			stopWords: [],
			synonymIds: []
		},
		isLoading: !!_id
	});

	React.useEffect(() => {
		if (!_id) {return;}
		fetchInterfaceGet({
			handleData: (data) => {
				//console.debug('data', data);
				setState(prev => {
					const deref = JSON.parse(JSON.stringify(prev));
					deref.isLoading = false;
					deref.initialValues = data.getInterface; // Also includes _nodeType, _path, _versionKey
					return deref;
				});
			},
			url: `${servicesBaseUrl}/graphQL`,
			variables: {
				_id
			}
		});
	}, []);

	const {
		initialValues,
		initialValues: {
			_name
		},
		isLoading
	} = state;
	//console.debug('NewOrEditInterface initialValues', initialValues);
	//console.debug('_name', _name);

	const disabled = _name === 'default';

	function mustBeUnique(v :string) {
		//console.debug(`mustBeUnique(${v}) interfaceNamesObj:`, interfaceNamesObj, ` interfaceNamesObj[${v}]:`, interfaceNamesObj[v]);
		if (interfaceNamesObj[v]) {
			return `Name must be unique: Name '${v}' is already in use!`;
		}
	}

	const schema :{
		_name? :(v :string) => string
	} = {};

	if (!_id) {
		schema._name = (v) => required(v)
			|| mustStartWithALowercaseLetter(v)
			|| onlyLowercaseAsciiLettersDigitsAndUnderscores(v)
			|| notDoubleUnderscore(v)
			|| mustBeUnique(v);
	}

	return isLoading ? <Loader active inverted>Loading</Loader> : <EnonicForm
		initialValues={initialValues}
		onSubmit={(values :{
			_name :string
			collectionIds :Array<string>
			fields :Array<string>
			stopWords :Array<string>
			synonymIds :Array<string>
		}) => {
			//console.debug('submit values', values);
			const {
				_name,
				collectionIds,
				fields,
				//stopWordIds,
				stopWords,
				synonymIds
			} = values; // Also includes _nodeType, _path, _versionKey
			const url = `${servicesBaseUrl}/graphQL`;
			(_id ? fetchInterfaceUpdate : fetchInterfaceCreate)({
				handleResponse(response) {
					if (response.status === 200) { doClose(); }
				},
				url,
				variables: {
					_id,
					_name,
					collectionIds,
					fields,
					//stopWordIds,
					stopWords,
					synonymIds
				}
			});
		}}
		schema={schema}
	>
		<Modal.Content>
			<Form as='div'>
				<Form.Field>
					<Input
						disabled={disabled}
						fluid
						label={{basic: true, content: 'Name'}}
						path='_name'
						placeholder='Please input name'
					/>
				</Form.Field>
				<Header as='h2' content='Collection(s)' disabled={disabled} dividing id='collections'/>
				<Form.Field>
					<Dropdown
						disabled={disabled}
						multiple={true}
						options={collectionOptions}
						path='collectionIds'
						placeholder='Please select one or more collections...'
						search
						selection
					/>
				</Form.Field>

				<Header as='h3' content='Fields' disabled={disabled} dividing id='fields'/>
				<FieldSelector
					disabled={disabled}
					collectionIdToFieldKeys={collectionIdToFieldKeys}
					globalFieldsObj={globalFieldsObj}
				/>

				<Header as='h3' content='Synonyms' disabled={disabled} dividing id='synonyms'/>
				<Form.Field><Dropdown
					disabled={disabled}
					fluid
					multiple={true}
					options={thesauriOptions}
					path='synonymIds'
					search
					selection
				/></Form.Field>
				<Header as='h3' content='Stop words' disabled={disabled} dividing id='stopwords'/>
				<Dropdown
					disabled={disabled}
					fluid
					multiple={true}
					options={stopWordOptions}
					path='stopWords'
					search
					selection
				/>
			</Form>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose}>Cancel</Button>
			<ResetButton secondary/>
			<SubmitButton disabled={disabled} primary><Icon name='save'/>Save</SubmitButton>
		</Modal.Actions>
	</EnonicForm>;
} // function NewOrEditInterface
