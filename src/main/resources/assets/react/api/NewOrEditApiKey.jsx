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
} from 'semantic-ui-react-form';
import {Dropdown} from 'semantic-ui-react-form/inputs/Dropdown';

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
		_name,
		doClose,
		initialValues = {
			collections: [],
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

	const interfaceOptions = queryInterfacesGraph.hits ? queryInterfacesGraph.hits.map(({_name: key}) => ({
		key,
		text: key,
		value: key
	})) : [];

	return <EnonicForm
		initialValues={initialValues}
		onSubmit={(values) => {
			//console.debug('submit values', values);
			if (_name) {
				values.name = _name;
			}
			fetch(`${servicesBaseUrl}/apiKey${_name ? 'Modify' : 'Create'}`, {
				method: 'POST',
				headers: {
					'Content-Type':	'application/json'
				},
				body: JSON.stringify(values)
			}).then((/*response*/) => {
				doClose();
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
