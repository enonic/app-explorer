import type {
	DocumentTypeModal,
	DocumentTypesComponentParams,
	DocumentTypesObj
} from './index.d';


import moment from 'moment';
import * as React from 'react';
import {
	Button,
	Header,
	Icon,
	Popup,
	Radio,
	Segment,
	Table
} from 'semantic-ui-react';

import {fetchDocumentTypes} from '../../../services/graphQL/fetchers/fetchDocumentTypes';
//import {fetchFields} from '../../../services/graphQL/fetchers/fetchFields';
import {ButtonEdit} from '../components/ButtonEdit';
import {ButtonNew} from '../components/ButtonNew';
import {useInterval} from '../utils/useInterval';
import {buildDocumentTypesObj} from './buildDocumentTypesObj';
import {EditManagedDocumentTypeWarningModal} from './EditManagedDocumentTypeWarningModal';
import {NewOrEditDocumentTypeModal} from './NewOrEditDocumentTypeModal';
import {DeleteDocumentTypeModal} from './DeleteDocumentTypeModal';


function getDefaultModalState(open = false) :DocumentTypeModal {
	return {
		_id: undefined,
		_name: undefined,
		open
	};
}

export function DocumentTypes({
	servicesBaseUrl
} :DocumentTypesComponentParams) {
	const [updatedAt, setUpdatedAt] = React.useState(moment());
	const [durationSinceLastUpdate, setDurationSinceLastUpdate] = React.useState('');

	//const [boolPoll, setBoolPoll] = React.useState(true);
	//const [globalFields, setGlobalFields] = React.useState([]);
	const [isLoading, setIsLoading] = React.useState(false);
	const [documentTypes, setDocumentTypes] = React.useState<DocumentTypesObj>({});
	const [currentDocumentTypeName, setCurrentDocumentTypeName] = React.useState('');
	const [editManagedDocumentTypeWarningModalOpen, setEditManagedDocumentTypeWarningModalOpen] = React.useState(false);


	// The modal state should be handled by newOrEditDocumentTypeModal
	const [newOrEditModalState, setNewOrEditModalState] = React.useState<DocumentTypeModal>(getDefaultModalState());

	const [showAddFields, setShowAddFields] = React.useState(false);
	const [showCollections, setShowCollections] = React.useState(false);
	const [showDocumentsPerCollection, setShowDocumentsPerCollection] = React.useState(false);
	const [showDetails/*, setShowDetails*/] = React.useState(false);
	const [showInterfaces, setShowInterfaces] = React.useState(false);
	const [showManagedBy, setShowManagedBy] = React.useState(false);
	//console.debug('DocumentTypes documentTypes', documentTypes);

	/*const globalFieldsObj = {};
	globalFields.forEach(({
		_id, key, fieldType,
		min, max,
		decideByType, enabled, fulltext, includeInAllText, nGram, path
	}) => {
		globalFieldsObj[_id] = {
			key, fieldType,
			min, max,
			decideByType, enabled, fulltext, includeInAllText, nGram, path
		};
	});*/
	//console.debug('DocumentTypes globalFieldsObj', globalFieldsObj);
	const memoizedUpdateState = React.useCallback(() => {
		setIsLoading(true);
		/*fetchFields({
			handleData: (data) => {
				setGlobalFields((data as any).queryFields.hits);
			},
			url: `${servicesBaseUrl}/graphQL`,
			variables: {
				includeSystemFields: false
			}
		});*/
		fetchDocumentTypes({
			handleData: (data) => {
				setDocumentTypes(buildDocumentTypesObj(data.queryDocumentTypes.hits));
				setUpdatedAt(moment());
				setIsLoading(false);
			},
			url: `${servicesBaseUrl}/graphQL`
		});
	}, [
		servicesBaseUrl
	]);

	React.useEffect(() => {
		// By default, useEffect() runs both after the first render and after every update.
		// React guarantees the DOM has been updated by the time it runs the effects.
		// React defers running useEffect until after the browser has painted, so doing extra work is less of a problem.
		//console.debug('DocumentTypes useEffect');
		memoizedUpdateState();
	}, [
		memoizedUpdateState
	]); // Only re-run the effect if whatevers inside [] changes
	// An empty array [] means on mount and unmount. This tells React that your effect doesn’t depend on any values from props or state.
	// If you pass an empty array ([]), the props and state inside the effect will always have their initial values

	/*useInterval(() => {
		// This will not run when a modal popup is open
		//console.debug('boolPoll', boolPoll);
		if (boolPoll) {
			queryDocumentTypes();
		}
	}, 2500);*/

	useInterval(() => {
		if (updatedAt) {
			setDurationSinceLastUpdate(
				moment
					.duration(updatedAt.diff(moment()))
					.humanize()
			);
		}
	}, 1000);


	return <>
		<Segment basic style={{
			marginLeft: -14,
			marginTop: -14,
			marginRight: -14
		}}>
			<Table basic collapsing compact>
				<Table.Body>
					<Table.Row verticalAlign='middle'>
						<Table.Cell collapsing>
							<Radio
								label={"Show all fields"}
								checked={showCollections}
								onChange={(
									//@ts-ignore
									ignored,
									{checked}
								) => {
									setShowCollections(checked);
									setShowInterfaces(checked);
									setShowAddFields(checked);
									setShowDocumentsPerCollection(checked);
									//setShowDetails(checked);
									setShowManagedBy(checked);
								}}
								toggle
							/>
						</Table.Cell>
						<Table.Cell collapsing>
							<Button
								basic
								color='blue'
								loading={isLoading}
								onClick={memoizedUpdateState}>Last updated: {durationSinceLastUpdate}</Button>
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>
		</Segment>
		<Header as='h1' content='Document types'/>
		<Table celled collapsing compact selectable singleLine striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Edit</Table.HeaderCell>
					<Table.HeaderCell>Name</Table.HeaderCell>
					{showCollections ? <Table.HeaderCell>Used in collections</Table.HeaderCell> : null}
					{showInterfaces ? <Table.HeaderCell>Used in interfaces</Table.HeaderCell> : null}
					<Table.HeaderCell textAlign='right'>Documents</Table.HeaderCell>
					{showDocumentsPerCollection ? <Table.HeaderCell>Documents per collection</Table.HeaderCell> : null}
					<Table.HeaderCell textAlign='right'>Field count</Table.HeaderCell>
					<Table.HeaderCell>Fields</Table.HeaderCell>
					{showAddFields ? <Table.HeaderCell>Add fields</Table.HeaderCell> : null}
					{showManagedBy ? <Table.HeaderCell>Managed by</Table.HeaderCell> : null}
					{showDetails ? <Table.HeaderCell>Details</Table.HeaderCell> : null}
					<Table.HeaderCell>Delete</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{Object.keys(documentTypes).map((documetTypeName) => documentTypes[documetTypeName]).map(({
					_id,
					_name,
					//_versionKey, // We get this inside NewOrEditDocumentTypeModal
					activeProperties,
					activePropertyNames,
					addFields = true,
					collectionNames,
					collections,
					documentsInTotal,
					interfaceNames,
					managedBy = ''
				}, index) => {
					return <Table.Row key={index}>
						<Table.Cell collapsing disabled={isLoading}>
							<Popup
								content={`Edit document type: ${_name}`}
								inverted
								trigger={<ButtonEdit disabled={isLoading} onClick={() => {
									setCurrentDocumentTypeName(_name);
									if (documentTypes[_name] && documentTypes[_name].managedBy) {
										setEditManagedDocumentTypeWarningModalOpen(true);
									} else {
										setNewOrEditModalState({
											_id,
											_name,
											open: true
										});
									}
								}}/>}
							/>
						</Table.Cell>
						<Table.Cell collapsing disabled={isLoading}>{_name}</Table.Cell>

						{showCollections ? <Table.Cell disabled={isLoading}><ul style={{
							listStyleType: 'none',
							margin: 0,
							padding: 0
						}}>{collectionNames.map((c, i) => <li key={i}>{c}</li>)}</ul></Table.Cell> : null}

						{showInterfaces ? <Table.Cell disabled={isLoading}><ul style={{
							listStyleType: 'none',
							margin: 0,
							padding: 0
						}}>{interfaceNames.sort().map((c, i) => <li key={i}>{c}</li>)}</ul></Table.Cell> : null}

						<Table.Cell collapsing disabled={isLoading} textAlign='right'>{documentsInTotal}</Table.Cell>

						{showDocumentsPerCollection ? <Table.Cell collapsing disabled={isLoading}>
							<ul style={{
								listStyleType: 'none',
								margin: 0,
								padding: 0
							}}>
								{Object.keys(collections).map((k, i) => <li key={i}>{k}({collections[k].documentsTotal})</li>)}
								<li>Total: {documentsInTotal}</li>
							</ul>
						</Table.Cell> : null}

						<Table.Cell collapsing disabled={isLoading} textAlign='right'>{activeProperties.length}</Table.Cell>
						<Table.Cell collapsing disabled={isLoading}>{activePropertyNames.sort().join(', ')}</Table.Cell>

						{showAddFields ? <Table.Cell collapsing disabled={isLoading}>{addFields ? <Icon color='green' disabled={isLoading} name='checkmark' size='large'/> : <Icon color='grey' disabled={isLoading} name='x' size='large'/>}</Table.Cell> : null}

						{showManagedBy ? <Table.Cell collapsing disabled={isLoading}>{managedBy}</Table.Cell> : null}

						{showDetails ? <Table.Cell collapsing>
							<Table>
								<Table.Header>
									<Table.Row>
										<Table.HeaderCell>Name</Table.HeaderCell>
										<Table.HeaderCell>Value type</Table.HeaderCell>
										<Table.HeaderCell textAlign='center'>Min</Table.HeaderCell>
										<Table.HeaderCell textAlign='center'>Max</Table.HeaderCell>
										<Table.HeaderCell textAlign='center'>Indexing</Table.HeaderCell>
										<Table.HeaderCell textAlign='center'>Fulltext</Table.HeaderCell>
										<Table.HeaderCell textAlign='center'>nGram</Table.HeaderCell>
										<Table.HeaderCell textAlign='center'>Include in _allText</Table.HeaderCell>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{activeProperties.map(({
										enabled,
										fulltext,
										includeInAllText,
										max,
										min,
										name,
										nGram,
										valueType
									}, k) => <Table.Row key={`${index}.${k}`}>
										<Table.Cell collapsing>{name}</Table.Cell>
										<Table.Cell collapsing>{valueType}</Table.Cell>
										<Table.Cell collapsing textAlign='center'>{min}</Table.Cell>
										<Table.Cell collapsing textAlign='center'>{max}</Table.Cell>
										<Table.Cell collapsing textAlign='center'>{enabled ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='grey' name='x' size='large'/>}</Table.Cell>
										<Table.Cell collapsing textAlign='center'>{enabled
											? fulltext ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='grey' name='x' size='large'/>
											: null
										}</Table.Cell>
										<Table.Cell collapsing textAlign='center'>{enabled
											? nGram ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='grey' name='x' size='large'/>
											: null
										}</Table.Cell>
										<Table.Cell collapsing textAlign='center'>{enabled
											? includeInAllText ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='grey' name='x' size='large'/>
											: null
										}</Table.Cell>
									</Table.Row>)}
								</Table.Body>
							</Table>
						</Table.Cell> : null}

						<Table.Cell collapsing disabled={isLoading}>
							<Button.Group>
								<DeleteDocumentTypeModal
									_id={_id}
									_name={_name}
									afterClose={() => {
										//console.debug('DeleteDocumentTypeModal afterClose');
										memoizedUpdateState();
										//setBoolPoll(true);
									}}
									beforeOpen={() => {
										//console.debug('DeleteDocumentTypeModal beforeOpen');
										//setBoolPoll(false);
									}}
									collectionNames={collectionNames}
									disabled={isLoading}
									servicesBaseUrl={servicesBaseUrl}
								/>
							</Button.Group>
						</Table.Cell>
					</Table.Row>;
				})}
			</Table.Body>
		</Table>

		<Popup
			content='New document type'
			inverted
			trigger={
				<ButtonNew onClick={() => {
					return setNewOrEditModalState(getDefaultModalState(true));
				}}/>
			}
		/>

		<NewOrEditDocumentTypeModal
			_id={newOrEditModalState._id}
			_name={newOrEditModalState._name}
			open={newOrEditModalState.open}
			documentTypes={documentTypes}
			setModalState={setNewOrEditModalState}
			onClose={() => {
				setNewOrEditModalState({ open: false });
				memoizedUpdateState();
				//setBoolPoll(true);
			}}
			onMount={() => {
				//console.debug('NewOrEditDocumentTypeModal onMount');
				//setBoolPoll(false);
			}}
			servicesBaseUrl={servicesBaseUrl}
		/>

		<EditManagedDocumentTypeWarningModal
			documentTypeName={currentDocumentTypeName}
			managedBy={documentTypes[currentDocumentTypeName] ? documentTypes[currentDocumentTypeName].managedBy : ''}
			onCancel={() => {
				setEditManagedDocumentTypeWarningModalOpen(false);
			}}
			onClose={() => {
				setEditManagedDocumentTypeWarningModalOpen(false);
			}}
			onConfirm={() => {
				setNewOrEditModalState({
					_id: documentTypes[currentDocumentTypeName]._id,
					_name: currentDocumentTypeName,
					open: true
				});
				setEditManagedDocumentTypeWarningModalOpen(false);
			}}
			open={editManagedDocumentTypeWarningModalOpen}
		/>
	</>;
} // DocumentTypes
