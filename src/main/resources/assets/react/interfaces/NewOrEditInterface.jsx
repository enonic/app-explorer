import {Form, Header, Loader} from 'semantic-ui-react';

import {Form as EnonicForm} from 'semantic-ui-react-form/Form';
import {Dropdown} from 'semantic-ui-react-form/inputs/Dropdown';
import {Input} from 'semantic-ui-react-form/inputs/Input';

import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';

import {FieldSelector} from './FieldSelector';

import {DEFAULT_INTERFACE_FIELDS} from '../../../constants';


export function NewOrEditInterface(props) {
	const {
		collectionOptions,
		fieldsObj,
		id, // nullable
		onClose,
		servicesBaseUrl,
		stopWordOptions,
		thesauriOptions
	} = props;
	//console.debug('NewOrEditInterface stopWordOptions', stopWordOptions);
	//console.debug('NewOrEditInterface thesauriOptions', thesauriOptions);

	//const [isLoading, setLoading] = React.useState(!!id);
	const [state, setState] = React.useState({
		initialValues: {
			_name: '',
			collections: [],
			displayName: '',
			fields: DEFAULT_INTERFACE_FIELDS,
			stopWords: [],
			synonyms: []
		},
		isLoading: !!id
	});

	React.useEffect(() => {
		if (!id) {return;}
		fetch(`${servicesBaseUrl}/interfaceGet?id=${id}`)
			.then(response => response.json())
			.then(data => {
				setState(prev => {
					const deref = JSON.parse(JSON.stringify(prev));
					deref.isLoading = false;
					deref.initialValues = data;
					return deref;
				});
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

	return isLoading ? <Loader active inverted>Loading</Loader> : <EnonicForm
		initialValues={initialValues}
		onSubmit={(values) => {
			//const {_name} = values;
			//console.debug('submit values', values);
			let url = `${servicesBaseUrl}/interface`;
			if (id) {
				url = `${url}Modify?id=${id}`;
			} else {
				url = `${url}Create`;
			}
			fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type':	'application/json'
				},
				body: JSON.stringify(values)
			}).then(response => {
				if (response.status === 200) { onClose(); }
			});
		}}
	>
		<Form as='div'>
			<Form.Field>
				<Input
					disabled={disabled}
					fluid
					label={{basic: true, content: 'Name'}}
					path='displayName'
					placeholder='Please input name'
				/>
			</Form.Field>
			<Header as='h2' content='Collection(s)' disabled={disabled} dividing id='collections'/>
			<Form.Field>
				<Dropdown
					disabled={disabled}
					multiple={true}
					options={collectionOptions}
					path='collections'
					placeholder='Please select one or more collections...'
					selection
				/>
			</Form.Field>

			<Header as='h3' content='Fields' disabled={disabled} dividing id='fields'/>
			<FieldSelector
				disabled={disabled}
				fieldsObj={fieldsObj}
			/>

			<Header as='h3' content='Synonyms' disabled={disabled} dividing id='synonyms'/>
			<Form.Field><Dropdown
				disabled={disabled}
				fluid
				multiple={true}
				options={thesauriOptions}
				path='synonyms'
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
			<Form.Field>
				<SubmitButton disabled={disabled}/>
				<ResetButton disabled={disabled}/>
			</Form.Field>
		</Form>
	</EnonicForm>;
} // function NewOrEditInterface
