import type {
	DocumentTypeModal,
	DocumentTypesComponentParams,
	DocumentTypesObj
} from './index.d';


import moment from 'moment';
import * as React from 'react';
import {
	Button,
	Grid,
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

	//const [globalFields, setGlobalFields] = React.useState([]);
	const [isLoading, setIsLoading] = React.useState(false);
	const [documentTypes, setDocumentTypes] = React.useState<DocumentTypesObj>({});
	const [currentDocumentTypeName, setCurrentDocumentTypeName] = React.useState('');
	const [editManagedDocumentTypeWarningModalOpen, setEditManagedDocumentTypeWarningModalOpen] = React.useState(false);


	// The modal state should be handled by newOrEditDocumentTypeModal
	const [newOrEditModalState, setNewOrEditModalState] = React.useState<DocumentTypeModal>(getDefaultModalState());

	const [showAllFields, setShowAllFields] = React.useState(false);
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

	React.useEffect(() => {
		setDurationSinceLastUpdate(
			moment
				.duration(updatedAt.diff(moment()))
				.humanize()
		);
	}, [
		updatedAt
	]);

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
		<Segment basic className='page'>
			<Grid>
				<Grid.Column floated='left' width={3}>
					<Table basic collapsing compact>
						<Table.Body>
							<Table.Row verticalAlign='middle'>
								<Table.Cell collapsing>
									<Radio
										label={'Show all fields'}
										checked={showAllFields}
										onChange={(
											//@ts-ignore
											ignored,
											{ checked }
										) => {
											setShowAllFields(checked);
										}}
										toggle
									/>
								</Table.Cell>
							</Table.Row>
						</Table.Body>
					</Table>
				</Grid.Column>
				<Grid.Column floated='right' width={4}>
					<Button
						basic
						floated='right'
						color='blue'
						loading={isLoading}
						onClick={memoizedUpdateState}><Icon className='refresh'/>Last updated: {durationSinceLastUpdate}</Button>
				</Grid.Column>
			</Grid>
		</Segment>
		<Header as='h1' content='Document types'/>
		<Table celled collapsing compact selectable singleLine striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Edit</Table.HeaderCell>
					<Table.HeaderCell>Name</Table.HeaderCell>
					{showAllFields ? <Table.HeaderCell>Used in collections</Table.HeaderCell> : null}
					{showAllFields ? <Table.HeaderCell>Used in interfaces</Table.HeaderCell> : null}
					<Table.HeaderCell textAlign='right'>Documents</Table.HeaderCell>
					{showAllFields ? <Table.HeaderCell>Documents per collection</Table.HeaderCell> : null}
					<Table.HeaderCell textAlign='right'>Field count</Table.HeaderCell>
					<Table.HeaderCell>Fields</Table.HeaderCell>
					{showAllFields ?
						<>
							<Table.HeaderCell>Add fields</Table.HeaderCell>
							<Table.HeaderCell>Managed by</Table.HeaderCell>
							<Table.HeaderCell>Delete</Table.HeaderCell>
						</>
						: null}
					{/* {showDetails ? <Table.HeaderCell>Details</Table.HeaderCell> : null} */}
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

						{showAllFields ? <Table.Cell disabled={isLoading}><ul style={{
							listStyleType: 'none',
							margin: 0,
							padding: 0
						}}>{collectionNames.map((c, i) => <li key={i}>{c}</li>)}</ul></Table.Cell> : null}

						{showAllFields ? <Table.Cell disabled={isLoading}><ul style={{
							listStyleType: 'none',
							margin: 0,
							padding: 0
						}}>{interfaceNames.sort().map((c, i) => <li key={i}>{c}</li>)}</ul></Table.Cell> : null}

						<Table.Cell collapsing disabled={isLoading} textAlign='right'>{documentsInTotal}</Table.Cell>

						{showAllFields ? <Table.Cell collapsing disabled={isLoading}>
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
						<Table.Cell collapsing disabled={isLoading}><ul style={{
							listStyleType: 'none',
							margin: 0,
							padding: 0
						}}>{activePropertyNames.sort().map((p, i) => <li key={i}>{p}</li>)}</ul></Table.Cell>

						{showAllFields ?
							<>
								<Table.Cell collapsing disabled={isLoading}>
									{addFields ?
										<Icon color='green' disabled={isLoading} name='checkmark' size='large'/>
										: <Icon color='grey' disabled={isLoading} name='x' size='large'/>}
								</Table.Cell>
								<Table.Cell collapsing disabled={isLoading}>{managedBy}</Table.Cell>
								<Table.Cell collapsing disabled={isLoading}>
									<Button.Group>
										<DeleteDocumentTypeModal
											_id={_id}
											_name={_name}
											afterClose={() => {
												//console.debug('DeleteDocumentTypeModal afterClose');
												memoizedUpdateState();
											}}
											collectionNames={collectionNames}
											disabled={isLoading}
											servicesBaseUrl={servicesBaseUrl}
										/>
									</Button.Group>
								</Table.Cell>
							</>
							: null}

						{/* {showDetails ? <Table.Cell collapsing>
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
						</Table.Cell> : null} */}


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
