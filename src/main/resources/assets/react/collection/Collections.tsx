import type {CollectionFormValues} from '@enonic-types/lib-explorer';
import type {
	CollectorComponents,
	SetLicensedToFunction,
	SetLicenseValidFunction
} from '../index.d';


import {
	// TASK_STATE_FAILED,
	// TASK_STATE_FINISHED,
	TASK_STATE_RUNNING,
	TASK_STATE_WAITING,
	lpad,
	rpad
} from '@enonic/js-utils';
import {parseExpression as parseCronExpression} from 'cron-parser';
import {Link} from 'react-router-dom';
import {
	Header,
	Form,
	Loader,
	Popup,
	Progress,
	Radio,
	Segment,
	Table,
} from 'semantic-ui-react';
import HoverButton from '../components/buttons/HoverButton';
import RefreshButton from '../components/buttons/RefreshButton';
import SearchInput from '../components/inputs/SearchInput';
import Flex from '../components/Flex';
import {Cron} from '../utils/Cron';
import {
	MONTH_TO_HUMAN
} from './SchedulingSegment';
import {CollectionCopyModal} from './CollectionCopyModal';
import {DeleteCollectionModal} from './delete/DeleteCollectionModal';
import {NewOrEditCollectionModal} from './NewOrEditCollectionModal';
import {useCollectionsState} from './useCollectionsState';


// const GQL_MUTATION_COLLECTIONS_REINDEX = `mutation ReindexMutation(
//   $collectionIds: [String]!
// ) {
//   reindexCollections(collectionIds: $collectionIds) {
//     collectionId
//     collectionName
//     message
//     documentTypeId
//     taskId
//   }
// }`;


export function Collections(props: {
	collectorComponents: CollectorComponents
	licenseValid: boolean
	newCollectionModalOpen?: boolean
	servicesBaseUrl: string
	setLicensedTo: SetLicensedToFunction
	setLicenseValid: SetLicenseValidFunction
}) {
	const {
		collectorComponents,
		licenseValid,
		newCollectionModalOpen = false,
		servicesBaseUrl,
		setLicensedTo,
		setLicenseValid,
	} = props;

	const {
		anyReindexTaskWithoutCollectionId,
		anyTaskWithoutCollectionName,
		collectionsTaskState,
		collectorIdToDisplayName, // setCollectorIdToDisplayName,
		collectorOptions,
		// column,
		contentTypeOptions,
		copyModalCollectionId, setCopyModalCollectionId,
		deleteCollectionModalState, setDeleteCollectionModalState,
		// direction,
		fieldsObj,
		intInitializedCollectorComponents,
		isBlurred,
		isLoading,
		jobsObj,
		locales,
		fetchOnUpdate,
		objCollectionsBeingReindexed,
		pollTasksWhileActive,
		queryCollectionsGraph,
		shemaIdToName,
		searchString, setSearchString, fetchCollections,
		setShowCollector,
		setShowDelete,
		setShowDocumentType,
		//setShowInterfaces,
		setShowLanguage,
		setShowSchedule,
		showCollector,
		showDelete,
		showDocumentCount,
		showDocumentType,
		//showInterfaces,
		showLanguage,
		showSchedule,
		siteOptions
	} = useCollectionsState({
		collectorComponents,
		servicesBaseUrl
	});

	return <>
		<Flex
			className='mt-1rem'
			justifyContent='center'
		>
			<Flex.Item
				className={[
					'w-ma-fullExceptGutters',
					'w-ma-widescreenExceptGutters-widescreenUp',
					'w-mi-tabletExceptGutters-tabletUp',
					'w-fullExceptGutters-mobileDown',
				].join(' ')}
				overflowX='hidden'
			>
				<Header as='h1'>Collections</Header>
				<Flex
					justifyContent='space-between'
					gap
					marginBottom
				>
					<Flex.Item>
						<Form style={{margin:0}}>
							<Form.Group style={{margin:0}}>
								<SearchInput
									disabled={isBlurred || isLoading}
									loading={isBlurred || isLoading}
									onChange={(
										_event: React.ChangeEvent<HTMLInputElement>,
										{value}
									) => {setSearchString(value)}}
									onKeyUp={(event: {
										which: number
									}) => {
										if(event.which == 10 || event.which == 13) {
											fetchCollections();
										}
									}}
									value={searchString}
								/>
								<Form.Field>
									<Segment style={{
										height: 38
									}}>
										<Radio
											label='Show all fields'
											checked={showCollector}
											onChange={(
												_event: unknown,
												{ checked }
											) => {
												setShowCollector(checked);
												// setShowDocumentCount(checked);
												setShowLanguage(checked);
												setShowDocumentType(checked);
												//setShowInterfaces(checked);
												setShowSchedule(checked);
												setShowDelete(checked);
											}}
											style={{
												top: '50%',
												transform: 'translate(0%, -50%)'
											}}
											toggle
										/>
									</Segment>
								</Form.Field>
							</Form.Group>
						</Form>
					</Flex.Item>
					<Flex.Item>
						<RefreshButton
							floated='right'
							loading={isLoading}
							onClick={fetchOnUpdate}
						/>
					</Flex.Item>
				</Flex>
				<div className='p-r'>{/* Use to position the blur overlay */}
					<Table
						celled
						compact
						striped
						className={isBlurred ? 'filt-b-5-g-0-7' : ''}
					>
						<Table.Header>
							<Table.Row>
								{/* Width is X columns of total 16 */}
								<Table.HeaderCell>Collect</Table.HeaderCell>
								<Table.HeaderCell
									onClick={null/*handleSortGenerator('displayName')*/}
									sorted={/*column === '_name' ? direction : */null}
								>Name</Table.HeaderCell>
								{showCollector ? <Table.HeaderCell>Collector</Table.HeaderCell> : null}
								{showDocumentCount ? <Table.HeaderCell>Documents</Table.HeaderCell> : null}
								{showLanguage ? <Table.HeaderCell>Language</Table.HeaderCell> : null}
								{showDocumentType ? <Table.HeaderCell>Document Type</Table.HeaderCell> : null}
								{/*showInterfaces ? <Table.HeaderCell>Interfaces</Table.HeaderCell> : null*/}
								{showSchedule ? <Table.HeaderCell>Schedule</Table.HeaderCell> : null }
								<Table.HeaderCell>Actions</Table.HeaderCell>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{queryCollectionsGraph.hits && queryCollectionsGraph.hits.map(({
								_id: collectionId,
								_name: collectionName,
								_path,
								collector,
								documentCount,
								//interfaces,
								language = '',
								documentTypeId = ''
							}, index) => {
								const key = `collection[${index}]`;

								const boolCollectorSelected = !!(collector && collector.name);
								//console.debug('boolCollectorSelected', boolCollectorSelected);

								const boolCollectorSelectedAndInitialized = !!(boolCollectorSelected && collectorComponents[collector.name]);
								//console.debug('boolCollectorSelectedAndInitialized', boolCollectorSelectedAndInitialized);

								const busy = anyReindexTaskWithoutCollectionId
								|| !!(
									objCollectionsBeingReindexed[collectionId]
									&& [TASK_STATE_RUNNING, TASK_STATE_WAITING].includes(objCollectionsBeingReindexed[collectionId].state)
								);
								//console.debug('busy', busy);

								const collectorNameOrEmpty = collector && collector.name && collectorIdToDisplayName[collector.name] || '';

								const editEnabled = intInitializedCollectorComponents
									&& (boolCollectorSelectedAndInitialized || !boolCollectorSelected)
									&& !busy;
								//console.debug('editEnabled', editEnabled);

								const disabled = !editEnabled || isLoading;
								//console.debug('disabled', disabled);

								const cron = jobsObj[collectionId]
									? jobsObj[collectionId].map(({value}) => {
										return new Cron(value).toObj();
									})
									: [new Cron('0 0 * * 0').toObj()]; // Default once a week
								const doCollect = jobsObj[collectionId] ? jobsObj[collectionId][0].enabled : false;
								return <Table.Row key={key}>
									<Table.Cell collapsing>
										{
											collector && collector.name
												? (collectionsTaskState[collectionName] && collectionsTaskState[collectionName].state)
													? {
														WAITING: <Popup
															content={`Collector is in waiting state`}
															inverted
															trigger={<HoverButton color='yellow' disabled={!boolCollectorSelectedAndInitialized} icon='pause'/>}/>,
														RUNNING: <Popup
															content={`Stop collecting to ${collectionName}`}
															inverted
															trigger={<HoverButton color='red' disabled={!boolCollectorSelectedAndInitialized} icon='stop' onClick={() => {
																fetch(`${servicesBaseUrl}/collectorStop?collectionName=${collectionName}`, {
																	method: 'POST'
																}).then(() => {
																	pollTasksWhileActive();
																});
															}}/>}/>,
														FINISHED: <Popup
															content={`Finished collecting to ${collectionName}`}
															inverted
															trigger={
																<HoverButton
																	color='green'
																	disabled={!boolCollectorSelectedAndInitialized || busy}
																	icon='checkmark'
																	onClick={() => {
																		fetch(`${servicesBaseUrl}/collectionCollect?id=${collectionId}&name=${collectionName}`, {
																			method: 'POST'
																		}).then(() => {
																			pollTasksWhileActive();
																		});
																	}}
																/>
															}/>,
														FAILED: <Popup
															content={`Something went wrong while collecting to ${collectionName}`}
															inverted
															trigger={<HoverButton color='red' disabled={!boolCollectorSelectedAndInitialized} icon='warning'/>}/>
													}[collectionsTaskState[collectionName].state]
													: anyTaskWithoutCollectionName
														? <Popup
															content={`Some collector task is starting...`}
															pollTasksWhileActive
															inverted
															trigger={<HoverButton color='yellow' disabled={!boolCollectorSelectedAndInitialized} icon='question' loading/>}/>
														: <Popup
															content={`Start collecting to ${collectionName}`}
															inverted
															trigger={
																<HoverButton
																	color={boolCollectorSelectedAndInitialized ? 'green' : 'grey'}
																	disabled={!boolCollectorSelectedAndInitialized || busy}
																	icon='cloud download'
																	onClick={() => {
																		fetch(`${servicesBaseUrl}/collectionCollect?id=${collectionId}&name=${collectionName}`, {
																			method: 'POST'
																		}).then(() => {
																			pollTasksWhileActive();
																		});
																	}}
																/>
															}
														/>
												: <HoverButton color='grey' disabled={true} icon='cloud download'/>
										}
									</Table.Cell>
									<Table.Cell collapsing>{collectionName}</Table.Cell>
									{busy
										? <Table.Cell collapsing colspan={
											(showCollector ? 1 : 0)
											+ (showDocumentCount ? 1 : 0)
											+ (showLanguage ? 1 : 0)
											+ (showDocumentType ? 1 : 0)
											//+ (showInterfaces ? 1 : 0)
											+ (showSchedule ? 1 : 0)
										}><Progress
												active
												progress='ratio'
												total={objCollectionsBeingReindexed[collectionId].total}
												value={objCollectionsBeingReindexed[collectionId].current}
											/>{'Reindexing...'}</Table.Cell>
										: <>
											{showCollector ? <Table.Cell collapsing>{collectorNameOrEmpty}</Table.Cell> : null}
											{showDocumentCount ? <Table.Cell collapsing>{
												documentCount === -1
													? ''
													: documentCount >= 1
														? <Link
															to={`/documents?collection=${collectionName}`}
														>{documentCount}</Link>
														: '0'
											}</Table.Cell> : null}
											{showLanguage ? <Table.Cell collapsing>{language}</Table.Cell> : null}
											{showDocumentType ? <Table.Cell collapsing>{
												collector && collector.managedDocumentTypes
													? <ul style={{
														listStyleType: 'none',
														margin: 0,
														padding: 0
													}}>{collector.managedDocumentTypes.map((mDTName, i) => <li key={i} style={{marginBottom: 3}}>{mDTName} <span style={{color:'gray'}}>(managed)</span></li>)}</ul>
													: shemaIdToName[documentTypeId]
											}</Table.Cell> : null }
											{/*showInterfaces ? <Table.Cell collapsing>{interfaces.map((iface, i :number) => <p key={i}>
												{i === 0 ? null : <br/>}
												<span style={{whiteSpace: 'nowrap'}}>{iface}</span>
											</p>)}</Table.Cell> : null*/}
											{showSchedule ? <Table.Cell>{
												collectorNameOrEmpty
													? jobsObj[collectionId]
														? jobsObj[collectionId].map(({enabled, value}, i: number) => {
															if (jobsObj[collectionId].length === 1 && !enabled) {
																return 'Inactive';
															}
															const interval = parseCronExpression(value);
															const fields = JSON.parse(JSON.stringify(interval.fields)); // Fields is immutable
															return <pre key={`${collectionName}.cron.${i}`} style={{color:enabled ? 'auto' : 'gray'}}>
																{`${Cron.hourToHuman(fields.hour)}:${
																	Cron.minuteToHuman(fields.minute)} ${
																	Cron.dayOfWeekToHuman(fields.dayOfWeek)} in ${
																	rpad(MONTH_TO_HUMAN[fields.month.length === 12 ? '*' : fields.month[0]], 11)} (dayOfMonth:${
																	lpad(fields.dayOfMonth.length === 31 ? '*' : fields.dayOfMonth)})`}
															</pre>;
														})
														: 'Not scheduled'
													: 'N/A'
											}</Table.Cell> : null}
										</>
									}
									<Table.Cell collapsing>
										<NewOrEditCollectionModal
											collections={queryCollectionsGraph.hits}
											collectorOptions={collectorOptions}
											collectorComponents={collectorComponents}
											contentTypeOptions={contentTypeOptions}
											disabled={disabled}
											initialValues={{
												_id: collectionId,
												_name: collectionName,
												_path,
												collector,
												cron,
												doCollect,
												documentTypeId,
												language
											}}
											fields={fieldsObj}
											loading={isLoading}
											locales={locales}
											_name={collectionName}
											afterClose={() => {
												//console.debug('NewOrEditCollectionModal afterClose');
												fetchOnUpdate();
											}}
											servicesBaseUrl={servicesBaseUrl}
											setLicensedTo={setLicensedTo}
											setLicenseValid={setLicenseValid}
											showUploadLicense={
												!licenseValid
												&& index > 2 // This means it's allowed to edit collection 3, but not number 4
											}
											siteOptions={siteOptions}
										/>
										{/*anyReindexTaskWithoutCollectionId
											? <Popup
												content={`Some reindex task is starting...`}
												inverted
												trigger={<Button disabled={true} icon loading><Icon color='yellow' name='question'/></Button>}/>
											: <Popup
												content={
													objCollectionsBeingReindexed[collectionId]
													&& [TASK_STATE_RUNNING, TASK_STATE_WAITING].includes(objCollectionsBeingReindexed[collectionId].state)
														? `Collection is being reindexed...`
														: 'Start reindex'
												}
												inverted
												trigger={<Button
													disabled={
														objCollectionsBeingReindexed[collectionId]
														&& [TASK_STATE_RUNNING, TASK_STATE_WAITING].includes(objCollectionsBeingReindexed[collectionId].state) }
													icon
													onClick={() => {
														fetch(`${servicesBaseUrl}/graphQL`, {
															method: 'POST',
															headers: { // HTTP/2 uses lowercase header keys
																'content-type': 'application/json'
															},
															body: JSON.stringify({
																query: GQL_MUTATION_COLLECTIONS_REINDEX,
																variables: {
																	collectionIds: [collectionId]
																}
															})
														})
															.then(res => res.json())
															.then(res => {
																console.debug(res);
															});
													}}
												>
													<Icon color={
														objCollectionsBeingReindexed[collectionId]
															? objCollectionsBeingReindexed[collectionId].state === TASK_STATE_FAILED
																? 'red'
																: [TASK_STATE_RUNNING, TASK_STATE_WAITING].includes(objCollectionsBeingReindexed[collectionId].state)
																	? 'yellow'
																	: 'green' // objCollectionsBeingReindexed[collectionId] === TASK_STATE_FINISHED
															: 'green'} name='recycle'/>
												</Button>}/>
										*/}
										<Popup
											content={`Copy collection ${collectionName}`}
											inverted
											trigger={
												<HoverButton
													color='blue'
													icon='copy'
													onClick={
														() => {
															setCopyModalCollectionId(collectionId);
														}
													}
												/>
											}
										/>
										{
											showDelete
												? <Popup
													content={`Delete collection ${collectionName}`}
													inverted
													trigger={
														<HoverButton
															color='red'
															disabled={busy}
															icon='trash alternate outline'
															onClick={
																() => {
																	setDeleteCollectionModalState({
																		collectionId,
																		collectionName,
																		open: true,
																	})
																}
															}
														/>
													}
												/>
												: null
										}
									</Table.Cell>
								</Table.Row>;
							})}
						</Table.Body>
					</Table>
					{
						isBlurred
							? <div className='br-table h-100p l-0 p-a t-0 w-100p'>
								<Loader active size='massive'/>
							</div>
							: null
					}

				</div>{/*<!-- position relative -->*/}
			</Flex.Item>
		</Flex>

		<NewOrEditCollectionModal
			collections={queryCollectionsGraph.hits}
			collectorOptions={collectorOptions}
			collectorComponents={collectorComponents}
			contentTypeOptions={contentTypeOptions}
			disabled={!intInitializedCollectorComponents || isLoading}
			defaultOpen={newCollectionModalOpen}
			loading={isLoading}
			fields={fieldsObj}
			initialValues={{
				_name: '',
				collector: {
					//config: {}, // CollectorSelector onChange will set this.
					//configJson: '{}',
					name: ''//,
					//taskName: 'collect'//, // TODO
				},
				cron: [{ // Default once a week
					month: '*',
					dayOfMonth: '*',
					dayOfWeek: '0',
					minute: '0',
					hour: '0'
				}],
				doCollect: false,
				language: ''
			} as CollectionFormValues}
			locales={locales}
			afterClose={() => {
				//console.debug('NewOrEditCollectionModal afterClose');
				fetchOnUpdate();
			}}
			servicesBaseUrl={servicesBaseUrl}
			setLicensedTo={setLicensedTo}
			setLicenseValid={setLicenseValid}
			showUploadLicense={
				!licenseValid
				&& queryCollectionsGraph.total > 2 // This means it will be allowed to create collection 3, but not number 4
			}
			siteOptions={siteOptions}
		/>
		{
			copyModalCollectionId
				? <CollectionCopyModal
					afterSuccess={() => {fetchOnUpdate()}}
					collectionId={copyModalCollectionId}
					collectionNames={queryCollectionsGraph.hits.map(({_name}) => _name)}
					servicesBaseUrl={servicesBaseUrl}
					setCopyModalCollectionId={setCopyModalCollectionId}
					setLicensedTo={setLicensedTo}
					setLicenseValid={setLicenseValid}
					showUploadLicense={
						!licenseValid
						&& queryCollectionsGraph.total > 2 // This means it will be allowed to copy to collection 3, but not number 4
					}
				/>
				: null
		}
		{
			deleteCollectionModalState.open
				? <DeleteCollectionModal
					collectionId={deleteCollectionModalState.collectionId}
					collectionName={deleteCollectionModalState.collectionName}
					onClose={() => {
						setDeleteCollectionModalState({
							collectionId: '',
							collectionName: '',
							open: false,
						})
						fetchOnUpdate();
					}}
				/>
				: null
		}
	</>;
} // Collections
