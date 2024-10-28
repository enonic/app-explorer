import type {NewOrEditInterfaceProps} from './index.d';


//import {toStr} from '@enonic/js-utils';
import {
	Button,
	Form,
	Header,
	Message,
	Modal,
} from 'semantic-ui-react';
import {ResetButton} from '../components/ResetButton';
import {SubmitButton} from '../components/SubmitButton';
import {fetchInterfaceCreate} from '../fetchers/fetchInterfaceCreate';
import {fetchInterfaceUpdate} from '../fetchers/fetchInterfaceUpdate';
import {BoostBuilder} from './boost/BoostBuilder';
import {useNewOrEditInterfaceState} from './useNewOrEditInterfaceState';


export function NewOrEditInterface({
	// Required
	fieldNameToValueTypesState,
	servicesBaseUrl,
	stopWordOptions,
	thesauriOptions,
	// Optional
	_id, // nullable
	collectionOptions = [],
	doClose = () => {/**/},
	interfaceNamesObj = {}
}: NewOrEditInterfaceProps) {
	//console.debug('NewOrEditInterface collectionOptions', collectionOptions);
	//console.debug('NewOrEditInterface stopWordOptions', stopWordOptions);
	//console.debug('NewOrEditInterface thesauriOptions', thesauriOptions);
	const {
		anyError,
		// boost, setBoost,
		collectionIdsFromStorage, setCollectionIdsFromStorage,
		isDefaultInterface,
		isLoading,
		isStateChanged,
		fieldButtonVisible, setFieldButtonVisible,
		fieldOptions,
		fields, setFields,
		fieldValueOptions, setFieldValueOptions,
		getFieldValues,
		name,
		nameError,
		nonExistantCollectionIds,
		resetState,
		setName,
		setNameVisited,
		setStopWords,
		setSynonymIds,
		stopWords,
		synonymIds,
		termQueries, setTermQueries,
		termButtonVisible, setTermButtonVisible,
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
					size='medium'
				/>
				<Form.Dropdown
					disabled={isLoading || isDefaultInterface}
					fluid
					loading={isLoading}
					multiple={true}
					options={collectionOptions}
					onChange={(_e,{value} :{value: Array<string>}) => setCollectionIdsFromStorage(value)}
					placeholder={isLoading || isLoading ? 'Fetching selected collections...' : 'Please select one or more collections'}
					search
					selection
					value={collectionIdsFromStorage}
				/>
				{
					nonExistantCollectionIds.length
						? <Message
							attached='bottom'
							icon='info'
							header="These references to collection-ids which doesn't exist, will be removed on save:"
							list={nonExistantCollectionIds}
							visible
							warning
						/>
						: null
				}
				<BoostBuilder
					collectionIdsFromStorage={collectionIdsFromStorage}
					fieldNameToValueTypesState={fieldNameToValueTypesState}
					fieldButtonVisible={fieldButtonVisible}
					fieldOptions={fieldOptions}
					fields={fields}
					fieldValueOptions={fieldValueOptions}
					getFieldValues={getFieldValues}
					isLoading={isLoading}
					isDefaultInterface={isDefaultInterface}
					termQueries={termQueries}
					servicesBaseUrl={servicesBaseUrl}
					setFieldButtonVisible={setFieldButtonVisible}
					setFields={setFields}
					setFieldValueOptions={setFieldValueOptions}
					setTermQueries={setTermQueries}
					termButtonVisible={termButtonVisible}
					setTermButtonVisible={setTermButtonVisible}
				/>
				<Header
					as='h3'
					content='Synonyms'
					disabled={isLoading || isDefaultInterface}
					dividing
					id='synonyms'
					size='medium'
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
					as='h2'
					content='Stop words'
					disabled={isLoading || isDefaultInterface}
					dividing
					id='stopwords'
					size='medium'
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
							collectionIds: collectionIdsFromStorage.filter(id => !nonExistantCollectionIds.includes(id)),
							fields,
							stopWords,
							synonymIds,
							termQueries
						}
					});
				}}
				primary
			/>
		</Modal.Actions>
	</>;
} // function NewOrEditInterface
