import {
	Button,
	Form,
	Header,
	Icon,
	Label,
	Modal
} from 'semantic-ui-react';
import {
	Form as EnonicForm,
	Input as EnonicInput,
	ResetButton,
	SubmitButton
	//@ts-ignore
} from 'semantic-ui-react-form';
//@ts-ignore
import {Dropdown} from 'semantic-ui-react-form/inputs/Dropdown';

import {GQL_MUTATION_API_KEY_CREATE} from '../../../services/graphQL/mutations/apiKeyCreateMutation';
import {GQL_MUTATION_API_KEY_UPDATE} from '../../../services/graphQL/mutations/apiKeyUpdateMutation';

import {GenerateKeyButton} from './GenerateKeyButton';


function makeKey({
	characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
	length = 32
} = {}) {
	let result = '';
	const charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}


export const NewOrEditApiKey = (props) => {
	//console.debug('props', props);
	const {
		_id,
		_name,
		doClose,
		initialValues = {
			collections: [],
			interfaces: [],
			key: _name ? '' : makeKey()//,
			//name: _name
		},
		queryCollectionsGraph,
		queryInterfacesGraph,
		servicesBaseUrl
	} = props;
	//console.debug('initialValues', initialValues);

	const collectionOptions = queryCollectionsGraph.hits ? queryCollectionsGraph.hits.map(({_name: key}) => ({
		key,
		text: key,
		value: key
	})) : [];
	//console.debug('collectionOptions', collectionOptions);

	const interfaceOptions = queryInterfacesGraph.hits ? queryInterfacesGraph.hits.map(({_name: key}) => ({
		key,
		text: key,
		value: key
	})) : [];
	//console.debug('interfaceOptions', interfaceOptions);

	return <EnonicForm
		initialValues={initialValues}
		onSubmit={(values) => {
			//console.debug('onSubmit values', values);
			const variables :{
				_id? :string // update
				_name? :string // create
				collections :Array<string>
				interfaces :Array<string>
				key? :string
			} = {
				collections: values.collections,
				interfaces: values.interfaces
			};
			if (_id) {
				variables._id = _id;
			}
			if (values.key) {
				variables.key = values.key;
			}
			if (values.name) {
				variables._name = values.name;
			}
			//console.debug('onSubmit variables', variables);
			fetch(`${servicesBaseUrl}/graphQL`, {
				method: 'POST',
				headers: {
					'Content-Type':	'application/json'
				},
				body: JSON.stringify({
					query: _id ? GQL_MUTATION_API_KEY_UPDATE : GQL_MUTATION_API_KEY_CREATE,
					variables
				})
			}).then((response) => {
				if (response.status === 200) { doClose(); }
			});
		}}
	>
		<Modal.Content>
			<Form as='div'>
				{_name
					? null
					: <Form.Field>
						<EnonicInput
							fluid
							label='Name'
							path='name'
						/>
					</Form.Field>
				}
				<Form.Field>
					<EnonicInput
						fluid
						path='key'
						placeholder={_name ? 'If you type anything here, it will overwrite the previous key on save' : 'Key is one way hashed on save'}
					>
						<Label content='Key' size='big'/>
						<input/>
						<GenerateKeyButton/>
					</EnonicInput>
				</Form.Field>
				<Header as='h2' content='Collections (read/write)' dividing id='collections'/>
				<Form.Field>
					<Dropdown
						multiple={true}
						options={collectionOptions}
						path='collections'
						placeholder='Please select one or more collections...'
						selection
					/>
				</Form.Field>
				<Header as='h2' content='Interfaces (read)' dividing id='interfaces'/>
				<Form.Field>
					<Dropdown
						multiple={true}
						options={interfaceOptions}
						path='interfaces'
						placeholder='Please select one or more interfaces...'
						selection
					/>
				</Form.Field>
			</Form>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose}>Cancel</Button>
			<ResetButton secondary/>
			<SubmitButton primary><Icon name='save'/>Save</SubmitButton>
		</Modal.Actions>
	</EnonicForm>;
}; // NewOrEditApiKey
