import type {NewOrEditInterfaceProps} from './index.d';


//import {toStr} from '@enonic/js-utils';
import {
	Button,
	Form,
	Header,
	Modal
} from 'semantic-ui-react';
import {ResetButton} from '../components/ResetButton';
import {SubmitButton} from '../components/SubmitButton';
import {fetchInterfaceCreate} from '../../../services/graphQL/fetchers/fetchInterfaceCreate';
import {fetchInterfaceUpdate} from '../../../services/graphQL/fetchers/fetchInterfaceUpdate';
import {FieldSelector} from './FieldSelector';
import {useNewOrEditInterfaceState} from './useNewOrEditInterfaceState';


export function NewOrEditInterface({
	// Required
	servicesBaseUrl,
	stopWordOptions,
	thesauriOptions,
	// Optional
	_id, // nullable
	collectionOptions = [],
	doClose = () => {/**/},
	interfaceNamesObj = {}
} :NewOrEditInterfaceProps) {
	//console.debug('NewOrEditInterface collectionOptions', collectionOptions);
	//console.debug('NewOrEditInterface stopWordOptions', stopWordOptions);
	//console.debug('NewOrEditInterface thesauriOptions', thesauriOptions);
	const {
		anyError,
		collectionIds,
		isDefaultInterface,
		isLoading,
		isStateChanged,
		fieldOptions,
		fields,
		name,
		nameError,
		resetState,
		setCollectionIds,
		setFields,
		setName,
		setNameVisited,
		setStopWords,
		setSynonymIds,
		stopWords,
		synonymIds
	} = useNewOrEditInterfaceState({
		_id,
		interfaceNamesObj,
		servicesBaseUrl
	});
	return <>
		<Modal.Content>
			<Form>
				<Form.Input
					disabled={isLoading || isDefaultInterface}
					error={nameError}
					fluid
					label='Name'
					loading={isLoading}
					onBlur={() => setNameVisited(true)}
					onChange={(_e,{value}) => {
						setNameVisited(true);
						setName(value);
					}}
					placeholder={isLoading ? 'Fetching name...' : 'Please input name'}
					required={true}
					value={name}
				/>
				<Header
					as='h2'
					content='Collection(s)'
					disabled={isLoading || isDefaultInterface}
					dividing
					id='collections'
				/>
				<Form.Dropdown
					disabled={isLoading || isDefaultInterface}
					fluid
					loading={isLoading}
					multiple={true}
					options={collectionOptions}
					onChange={(_e,{value} :{value: Array<string>}) => setCollectionIds(value)}
					placeholder={isLoading || isLoading ? 'Fetching selected collections...' : 'Please select one or more collections'}
					search
					selection
					value={collectionIds}
				/>
				<Header
					as='h3'
					content='Fields'
					disabled={isLoading || isDefaultInterface}
					dividing
					id='fields'
				/>
				<FieldSelector
					disabled={isLoading || isDefaultInterface}
					fieldOptions={fieldOptions}
					setFields={setFields}
					value={fields}
				/>
				<Header
					as='h3'
					content='Synonyms'
					disabled={isLoading || isDefaultInterface}
					dividing
					id='synonyms'
				/>
				<Form.Dropdown
					disabled={isLoading || isDefaultInterface}
					fluid
					loading={isLoading}
					multiple={true}
					options={thesauriOptions}
					onChange={(_e,{value} :{value: Array<string>}) => setSynonymIds(value)}
					placeholder={isLoading ? 'Fetching selected synonyms...' : undefined}
					search
					selection
					value={synonymIds}
				/>
				<Header
					as='h3'
					content='Stop words'
					disabled={isLoading || isDefaultInterface}
					dividing
					id='stopwords'
				/>
				<Form.Dropdown
					disabled={isLoading || isDefaultInterface}
					fluid
					loading={isLoading}
					multiple={true}
					options={stopWordOptions}
					onChange={(_e,{value} :{value: Array<string>}) => setStopWords(value)}
					placeholder={isLoading ? 'Fetching selected stop words...' : undefined}
					search
					selection
					value={stopWords}
				/>
			</Form>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose}>Cancel</Button>
			<ResetButton
				disabled={isLoading || isDefaultInterface}
				isStateChanged={isStateChanged}
				onClick={() => resetState()}
				secondary
			/>
			<SubmitButton
				disabled={isLoading || isDefaultInterface || anyError}
				errorCount={anyError ? 1 : 0}
				isStateChanged={isStateChanged}
				negative={anyError}
				onClick={()=>{
					const url = `${servicesBaseUrl}/graphQL`;
					(_id ? fetchInterfaceUpdate : fetchInterfaceCreate)({
						handleResponse(response) {
							if (response.status === 200) { doClose(); }
						},
						url,
						variables: {
							_id,
							_name: name,
							collectionIds,
							fields,
							stopWords,
							synonymIds
						}
					});
				}}
				primary
			/>
		</Modal.Actions>
	</>;
} // function NewOrEditInterface
