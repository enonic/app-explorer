import {
	Button,
	Header,
	Icon,
	Label,
	Radio,
	Segment,
	Table
} from 'semantic-ui-react';

import {useInterval} from '../utils/useInterval';

import {NewOrEditDocumentTypeModal} from './NewOrEditDocumentTypeModal';
import {DeleteDocumentTypeModal} from './DeleteDocumentTypeModal';
import {fetchDocumentTypes} from '../../../services/graphQL/fetchers/fetchDocumentTypes.mjs';
import {fetchFields} from '../fields/fetchFields';


export function DocumentTypes({
	servicesBaseUrl
}) {
	const [boolPoll, setBoolPoll] = React.useState(true);
	const [globalFields, setGlobalFields] = React.useState([]);
	const [documentTypes, setDocumentTypes] = React.useState([]);
	const [showDeleteButton, setShowDeleteButton] = React.useState(false);
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
		fetchFields({
			handleData: (data) => {
				setGlobalFields(data.queryFields.hits);
			},
			url: `${servicesBaseUrl}/graphQL`,
			variables: {
				includeSystemFields: false
			}
		});
		fetchDocumentTypes({
			handleData: (data) => {
				setDocumentTypes(data.queryDocumentTypes.hits);
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

	useInterval(() => {
		// This will not run when a modal popup is open
		//console.debug('boolPoll', boolPoll);
		if (boolPoll) {
			queryDocumentTypes();
		}
	}, 2500);

	return <>
		<Segment basic inverted style={{
			marginLeft: -14,
			marginTop: -14,
			marginRight: -14
		}}>
			<Table basic collapsing compact inverted>
				<Table.Body>
					<Table.Row verticalAlign='middle'>
						<Table.Cell collapsing>
							<Radio
								checked={showDeleteButton}
								onChange={(ignored,{checked}) => {
									setShowDeleteButton(checked);
								}}
								toggle
							/>
							<Label color='black' size='large'>Show delete button</Label>
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
					<Table.HeaderCell>Used in collections</Table.HeaderCell>
					<Table.HeaderCell>Used in interfaces</Table.HeaderCell>
					<Table.HeaderCell>Property count</Table.HeaderCell>
					<Table.HeaderCell>Properties</Table.HeaderCell>
					<Table.HeaderCell>Add fields</Table.HeaderCell>
					<Table.HeaderCell>Properties</Table.HeaderCell>
					{showDeleteButton ?<Table.HeaderCell>Delete</Table.HeaderCell> : null}
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
					fields = [],
					properties = []
				}, index) => {
					const collections = [];
					const interfaces = [];
					referencedByCollections.forEach(({
						_name: collectionName,
						_nodeType,
						_referencedBy: {
							//count
							hits: referencedByInterfaces
							//total
						}
					}) => {
						if (_nodeType === 'com.enonic.app.explorer:collection' && !collections.includes(collectionName)) {
							collections.push(collectionName);
							referencedByInterfaces.forEach(({
								_name: interfaceName,
								_nodeType: interfaceNodeType
							}) => {
								if (interfaceNodeType === 'com.enonic.app.explorer:interface' && !interfaces.includes(interfaceName)) {
									interfaces.push(interfaceName);
								}
							});
						}
					});

					return <Table.Row key={index}>
						<Table.Cell collapsing><NewOrEditDocumentTypeModal
							_id={_id}
							_name={_name}
							collections={collections}
							interfaces={interfaces}
							afterClose={() => {
								//console.debug('NewOrEditDocumentTypeModal afterClose');
								queryDocumentTypes();
								setBoolPoll(true);
							}}
							beforeOpen={() => {
								//console.debug('NewOrEditDocumentTypeModal beforeOpen');
								setBoolPoll(false);
							}}
							servicesBaseUrl={servicesBaseUrl}
						/></Table.Cell>
						<Table.Cell collapsing>{_name}</Table.Cell>
						<Table.Cell><ul style={{
							listStyleType: 'none',
							margin: 0,
							padding: 0
						}}>{collections.sort().map((c, i) => <li key={i}>{c}</li>)}</ul></Table.Cell>
						<Table.Cell><ul style={{
							listStyleType: 'none',
							margin: 0,
							padding: 0
						}}>{interfaces.sort().map((c, i) => <li key={i}>{c}</li>)}</ul></Table.Cell>
						<Table.Cell collapsing>{properties.length}</Table.Cell>
						<Table.Cell collapsing>{properties.map(({name})=>name).join(', ')}</Table.Cell>
						<Table.Cell collapsing>{addFields ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
						<Table.Cell collapsing>
							<Table>
								<Table.Header>
									<Table.Row>
										<Table.HeaderCell>Name</Table.HeaderCell>
										<Table.HeaderCell>Value type</Table.HeaderCell>
										<Table.HeaderCell>Min</Table.HeaderCell>
										<Table.HeaderCell>Max</Table.HeaderCell>
										<Table.HeaderCell>Indexing</Table.HeaderCell>
										<Table.HeaderCell>Fulltext</Table.HeaderCell>
										<Table.HeaderCell>nGram</Table.HeaderCell>
										<Table.HeaderCell>Include in _allText</Table.HeaderCell>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{fields.map(({
										active,
										fieldId
									}, j) => {
										const fieldObj = globalFieldsObj[fieldId] || {};
										const {
											enabled,
											fieldType,
											fulltext,
											includeInAllText,
											max,
											min,
											key,
											ngram
										} = fieldObj;
										return <Table.Row disabled={!active} key={`${index}.${j}`}>
											<Table.Cell collapsing>{key}</Table.Cell>
											<Table.Cell collapsing>{fieldType}</Table.Cell>
											<Table.Cell collapsing>{min}</Table.Cell>
											<Table.Cell collapsing>{max}</Table.Cell>
											<Table.Cell collapsing>{enabled ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
											<Table.Cell disabled={!enabled} collapsing>{fulltext ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
											<Table.Cell disabled={!enabled} collapsing>{ngram ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
											<Table.Cell disabled={!enabled} collapsing>{includeInAllText ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
										</Table.Row>;
									})}
								</Table.Body>
							</Table>
							<Table>
								<Table.Header>
									<Table.Row>
										<Table.HeaderCell>Name</Table.HeaderCell>
										<Table.HeaderCell>Value type</Table.HeaderCell>
										<Table.HeaderCell>Min</Table.HeaderCell>
										<Table.HeaderCell>Max</Table.HeaderCell>
										<Table.HeaderCell>Indexing</Table.HeaderCell>
										<Table.HeaderCell>Fulltext</Table.HeaderCell>
										<Table.HeaderCell>nGram</Table.HeaderCell>
										<Table.HeaderCell>Include in _allText</Table.HeaderCell>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{properties.map(({
										enabled,
										fulltext,
										includeInAllText,
										max,
										min,
										name,
										ngram,
										valueType
									}, k) => <Table.Row key={`${index}.${k}`}>
										<Table.Cell collapsing>{name}</Table.Cell>
										<Table.Cell collapsing>{valueType}</Table.Cell>
										<Table.Cell collapsing>{min}</Table.Cell>
										<Table.Cell collapsing>{max}</Table.Cell>
										<Table.Cell collapsing>{enabled ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
										<Table.Cell disabled={!enabled} collapsing>{fulltext ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
										<Table.Cell disabled={!enabled} collapsing>{ngram ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
										<Table.Cell disabled={!enabled} collapsing>{includeInAllText ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='red' name='x' size='large'/>}</Table.Cell>
									</Table.Row>)}
								</Table.Body>
							</Table>
						</Table.Cell>
						{showDeleteButton ?<Table.Cell collapsing>
							<Button.Group>
								<DeleteDocumentTypeModal
									_id={_id}
									_name={_name}
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
						</Table.Cell> : null}
					</Table.Row>;
				})}
			</Table.Body>
		</Table>
		<NewOrEditDocumentTypeModal
			afterClose={() => {
				//console.debug('NewOrEditDocumentTypeModal afterClose');
				queryDocumentTypes();
				setBoolPoll(true);
			}}
			beforeOpen={() => {
				//console.debug('NewOrEditDocumentTypeModal beforeOpen');
				setBoolPoll(false);
			}}
			servicesBaseUrl={servicesBaseUrl}
		/>
	</>;
} // DocumentTypes
