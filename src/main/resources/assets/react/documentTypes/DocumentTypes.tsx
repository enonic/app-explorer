import moment from 'moment';
import React from 'react';
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
import {fetchFields} from '../../../services/graphQL/fetchers/fetchFields';
import {ButtonEdit} from '../components/ButtonEdit';
import {ButtonNew} from '../components/ButtonNew';
import {useInterval} from '../utils/useInterval';
import {NewOrEditDocumentTypeModal} from './NewOrEditDocumentTypeModal';
import {DeleteDocumentTypeModal} from './DeleteDocumentTypeModal';


interface DocumentTypeModal {
	_id? :string,
	_name? :string,
	collectionsArr? :Array<string>,
	interfacesArr? :Array<string>,
	open :boolean,
}

function getDefaultModalState(open = false) {
	return {
		_id: undefined,
		_name: undefined,
		collectionsArr: [],
		interfacesArr: [],
		open
	};
}

export function DocumentTypes({
	servicesBaseUrl
}) {
	const [updatedAt, setUpdatedAt] = React.useState(moment());
	const [durationSinceLastUpdate, setDurationSinceLastUpdate] = React.useState('');

	const [boolPoll, setBoolPoll] = React.useState(true);
	const [globalFields, setGlobalFields] = React.useState([]);
	const [documentTypes, setDocumentTypes] = React.useState([]);

	// The modal state should be handled by newOrEditDocumentTypeModal
	const [newOrEditModalState, setNewOrEditModalState] = React.useState(getDefaultModalState() as DocumentTypeModal);

	const [showAddFields, setShowAddFields] = React.useState(false);
	const [showCollections, setShowCollections] = React.useState(false);
	const [showDocumentsPerCollection, setShowDocumentsPerCollection] = React.useState(false);
	const [showDetails, setShowDetails] = React.useState(false);
	const [showInterfaces, setShowInterfaces] = React.useState(false);
	//console.debug('DocumentTypes documentTypes', documentTypes);

	const globalFieldsObj = {};
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
	});
	//console.debug('DocumentTypes globalFieldsObj', globalFieldsObj);

	function queryDocumentTypes() {
		setUpdatedAt(moment());
		fetchFields({
			handleData: (data) => {
				setGlobalFields((data as any).queryFields.hits);
			},
			url: `${servicesBaseUrl}/graphQL`,
			variables: {
				includeSystemFields: false
			}
		});
		fetchDocumentTypes({
			handleData: (data) => {
				setDocumentTypes((data as any).queryDocumentTypes.hits);
			},
			url: `${servicesBaseUrl}/graphQL`
		});
	} // queryDocumentTypes

	React.useEffect(() => {
		// By default, useEffect() runs both after the first render and after every update.
		// React guarantees the DOM has been updated by the time it runs the effects.
		// React defers running useEffect until after the browser has painted, so doing extra work is less of a problem.
		//console.debug('DocumentTypes useEffect');
		queryDocumentTypes();
	}, []); // Only re-run the effect if whatevers inside [] changes
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
								onChange={(ignored,{checked}) => {
									setShowCollections(checked);
									setShowInterfaces(checked);
									setShowAddFields(checked);
									setShowDocumentsPerCollection(checked);
									setShowDetails(checked);
								}}
								toggle
							/>
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>
		</Segment>
		<Header as='h1' content='Document types'/>
		<Button onClick={queryDocumentTypes}>Last updated: {durationSinceLastUpdate}</Button>
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
					{showDetails ? <Table.HeaderCell>Details</Table.HeaderCell> : null}
					<Table.HeaderCell>Delete</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{documentTypes.map(({
					_id,
					_name,
					_referencedBy: {
						//count
						hits: referencedByCollections
						//total
					},
					//_versionKey, // We get this inside NewOrEditDocumentTypeModal
					addFields = true,
					properties = []
				}, index) => {
					const collectionsObj = {};
					const interfacesArr = [];
					let documentsInTotal = 0;
					referencedByCollections.forEach(({
						_name: collectionName,
						_nodeType,
						_hasField: {
							total: documentsWithNameInCollectionRepoTotal
						},
						_referencedBy: {
							//count
							hits: referencedByInterfaces
							//total
						}
					}) => {
						documentsInTotal += documentsWithNameInCollectionRepoTotal;
						if (_nodeType === 'com.enonic.app.explorer:collection' && !collectionsObj[collectionName]) {
							collectionsObj[collectionName] = {
								documentsTotal: documentsWithNameInCollectionRepoTotal
							};
							referencedByInterfaces.forEach(({
								_name: interfaceName,
								_nodeType: interfaceNodeType
							}) => {
								if (interfaceNodeType === 'com.enonic.app.explorer:interface' && !interfacesArr.includes(interfaceName)) {
									interfacesArr.push(interfaceName);
								}
							});
						}
					}); // forEach referencedByCollections
					const collectionsArr = Object.keys(collectionsObj).sort();
					const activeProperties = properties.filter(({active}) => active);
					const activePropertyNames = activeProperties.map(({name})=>name).sort();

					return <Table.Row key={index}>
						<Table.Cell collapsing>
							<Popup
								content={`Edit document type: ${_name}`}
								inverted
								trigger={<ButtonEdit onClick={() => setNewOrEditModalState({
									_id,
									_name,
									collectionsArr,
									interfacesArr,
									open: true
								})}/>}
							/>
						</Table.Cell>
						<Table.Cell collapsing>{_name}</Table.Cell>

						{showCollections ? <Table.Cell><ul style={{
							listStyleType: 'none',
							margin: 0,
							padding: 0
						}}>{collectionsArr.map((c, i) => <li key={i}>{c}</li>)}</ul></Table.Cell> : null}

						{showInterfaces ? <Table.Cell><ul style={{
							listStyleType: 'none',
							margin: 0,
							padding: 0
						}}>{interfacesArr.sort().map((c, i) => <li key={i}>{c}</li>)}</ul></Table.Cell> : null}

						<Table.Cell collapsing textAlign='right'>{documentsInTotal}</Table.Cell>

						{showDocumentsPerCollection ? <Table.Cell collapsing>
							<ul style={{
								listStyleType: 'none',
								margin: 0,
								padding: 0
							}}>
								{Object.keys(collectionsObj).map((k, i) => <li key={i}>{k}({collectionsObj[k].documentsTotal})</li>)}
								<li>Total: {documentsInTotal}</li>
							</ul>
						</Table.Cell> : null}

						<Table.Cell collapsing textAlign='right'>{activeProperties.length}</Table.Cell>
						<Table.Cell collapsing>{activePropertyNames.sort().join(', ')}</Table.Cell>

						{showAddFields ? <Table.Cell collapsing>{addFields ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='grey' name='x' size='large'/>}</Table.Cell> : null}

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

						<Table.Cell collapsing>
							<Button.Group>
								<DeleteDocumentTypeModal
									_id={_id}
									_name={_name}
									collectionsArr={collectionsArr}
									afterClose={() => {
										//console.debug('DeleteDocumentTypeModal afterClose');
										queryDocumentTypes();
										setBoolPoll(true);
									}}
									beforeOpen={() => {
										//console.debug('DeleteDocumentTypeModal beforeOpen');
										setBoolPoll(false);
									}}
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
			collectionsArr={newOrEditModalState.collectionsArr}
			interfacesArr={newOrEditModalState.interfacesArr}
			open={newOrEditModalState.open}
			documentTypes={documentTypes}
			setModalState={setNewOrEditModalState}
			onClose={() => {
				setNewOrEditModalState({ open: false });
				queryDocumentTypes();
				setBoolPoll(true);
			}}
			onMount={() => {
				setBoolPoll(false);
			}}
			servicesBaseUrl={servicesBaseUrl}
		/>
	</>;
} // DocumentTypes
