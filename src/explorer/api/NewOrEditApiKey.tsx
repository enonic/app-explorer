import type {QueryApiKeysHits} from './index.d';


import {fold} from '@enonic/js-utils';
import {
	Button,
	Dropdown,
	Form,
	Header,
	Label,
	Modal
} from 'semantic-ui-react';
import {GQL_MUTATION_API_KEY_CREATE} from '../mutations/apiKeyCreateMutation';
import {GQL_MUTATION_API_KEY_UPDATE} from '../mutations/apiKeyUpdateMutation';
import {ResetButton} from '../components/ResetButton';
import {SubmitButton} from '../components/SubmitButton';
import {useNewOrEditApiKeyState} from './useNewOrEditApiKeyState';
import {GenerateKeyButton} from './GenerateKeyButton';
import {nameValidator} from '../utils/nameValidator';


export const NewOrEditApiKey = (props: {
	// Required
	apiKeys: QueryApiKeysHits
	doClose: () => void
	servicesBaseUrl: string
	// Optional
	_id?: string
	_name?: string
	collections?: string[]
	interfaces?: string[]
}) => {
	//console.debug('props', props);
	const {
		// Required
		apiKeys,
		doClose,
		servicesBaseUrl,
		// Optional
		_id,
		_name = '',
		collections = [],
		interfaces = [],
	} = props;
	//console.debug('initialValues', initialValues);

	const {
		apiKeyNames,
		collectionNames,
		collectionOptions,
		interfaceOptions,
		interfaceNames,
		isStateChanged,
		key,
		name,
		nameError,
		resetState,
		setCollectionNames,
		setInterfaceNames,
		setKey,
		setName,
		setNameError,
	} = useNewOrEditApiKeyState({
		_name,
		apiKeys,
		collections,
		interfaces,
		servicesBaseUrl
	});

	return <>
		<Modal.Content>
			<Form>
				{_name
					? null
					: <Form.Input
						error={nameError}
						fluid
						onChange={(
							_event,
							data: {
								value: string
							}
						) => {
							const newName = fold(data.value.toLowerCase());
							setName(newName);
							const newError = apiKeyNames.includes(newName)
								? `name "${newName}" already in use, please input another name.`
								: nameValidator(newName);
							if (newError !== nameError) {
								setNameError(newError);
							}
						}}
						label='Name'
						placeholder='Please input a unique name'
						value={name}
					/>
				}
				<Form.Input
					fluid
					onChange={(_e,{value:newKey}: {value: string}) => setKey(newKey)}
					placeholder={_name ? 'If you type anything here, it will overwrite the previous key on save' : 'Key is one way hashed on save'}
					value={key}
				>
					<Label content='Key' size='big'/>
					<input/>
					<GenerateKeyButton
						setKey={setKey}
					/>
				</Form.Input>
				<Header
					as='h2'
					content='Collections (read/write)'
					dividing
					id='collections'
				/>
				<Form.Field>
					<Dropdown
						multiple={true}
						options={collectionOptions}
						onChange={(_e,{value}: {value: Array<string>}) => setCollectionNames(value)}
						placeholder='Please select one or more collections...'
						selection
						value={collectionNames}
					/>
				</Form.Field>
				<Header
					as='h2'
					content='Interfaces (read)'
					dividing
					id='interfaces'
				/>
				<Form.Field>
					<Dropdown
						multiple={true}
						options={interfaceOptions}
						onChange={(_e,{value}: {value: Array<string>}) => setInterfaceNames(value)}
						placeholder='Please select one or more interfaces...'
						selection
						value={interfaceNames}
					/>
				</Form.Field>
			</Form>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose}>Cancel</Button>
			<ResetButton
				isStateChanged={isStateChanged}
				onClick={() => resetState()}
				secondary
			/>
			<SubmitButton
				disabled={!!nameError}
				isStateChanged={isStateChanged}
				onClick={() => {
					//console.debug('onSubmit values', values);
					const variables: {
						_id?: string // update
						_name?: string // create
						collections: string[]
						interfaces: string[]
						key?: string
					} = {
						_name: name,
						collections: collectionNames,
						interfaces: interfaceNames
					};
					if (_id) {
						variables._id = _id;
					}
					if (key) {
						variables.key = key;
					}
					//console.debug('onSubmit variables', variables);
					fetch(`${servicesBaseUrl}/graphQL`, {
						method: 'POST',
						headers: { // HTTP/2 uses lowercase header keys
							'content-type':	'application/json'
						},
						body: JSON.stringify({
							query: _id ? GQL_MUTATION_API_KEY_UPDATE : GQL_MUTATION_API_KEY_CREATE,
							variables
						})
					}).then((response) => {
						if (response.status === 200) { doClose(); }
					});
				}}
				primary
			/>
		</Modal.Actions>
	</>;
}; // NewOrEditApiKey
