import type {
	ApiKeyFormValues,
	QueryApiKeysHits
} from './index.d';


import {fold} from '@enonic/js-utils';
import {
	Button,
	Form,
	Header,
	Icon,
	Label,
	Modal
} from 'semantic-ui-react';
import {
	Dropdown,
	Form as EnonicForm,
	Input as EnonicInput,
	//ResetButton,
	SubmitButton
} from '@enonic/semantic-ui-react-form';
import {GQL_MUTATION_API_KEY_CREATE} from '../../../services/graphQL/mutations/apiKeyCreateMutation';
import {GQL_MUTATION_API_KEY_UPDATE} from '../../../services/graphQL/mutations/apiKeyUpdateMutation';
import {useNewOrEditApiKeyState} from './useNewOrEditApiKeyState';
import {GenerateKeyButton} from './GenerateKeyButton';
import {nameValidator} from '../utils/nameValidator';


function makeKey({
	characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
	length = 32
} = {}) {
	let result = '';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}


export const NewOrEditApiKey = (props :{
	// Required
	apiKeys: QueryApiKeysHits
	doClose :() => void
	servicesBaseUrl :string
	// Optional
	_id ?:string
	_name ?:string
	initialValues ?:ApiKeyFormValues
}) => {
	//console.debug('props', props);
	const {
		// Required
		apiKeys,
		doClose,
		servicesBaseUrl,
		// Optional
		_id,
		_name,
		initialValues = {
			collections: [],
			interfaces: [],
			key: _name ? '' : makeKey()
		}
	} = props;
	//console.debug('initialValues', initialValues);

	const {
		apiKeyNames,
		collectionOptions,
		interfaceOptions,
		name,
		nameError,
		setName,
		setNameError,
	} = useNewOrEditApiKeyState({
		apiKeys,
		servicesBaseUrl
	});

	return <EnonicForm<ApiKeyFormValues>
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
			if (name) {
				variables._name = name;
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
						<Form.Input
							error={nameError}
							fluid
							onChange={(
								//@ts-ignore
								event :unknown,
								data :{
									value :string
								}
							) => {
								// setName(data.value);
								const newName = fold(data.value.toLowerCase());
								setName(newName);
								setNameError(apiKeyNames.includes(newName)
									? `name "${newName}" already in use, please input another name.`
									: nameValidator(newName)
								);
							}}
							label='Name'
							placeholder='Please input an unique name'
							value={name}
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
			{/*<ResetButton secondary/>*/}
			<SubmitButton disabled={!!nameError} primary><Icon name='save'/>Save</SubmitButton>
		</Modal.Actions>
	</EnonicForm>;
}; // NewOrEditApiKey
