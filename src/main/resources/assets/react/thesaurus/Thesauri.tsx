import type {
	SetLicensedToFunction,
	SetLicenseValidFunction
} from '../index.d';

//import {getIn} from '@enonic/js-utils';
import {
	Button,
	//Dimmer,
	Grid,
	Header,
	Icon,
	//Loader,
	Popup,
	Radio,
	Segment,
	Table
} from 'semantic-ui-react';

import {EditSynonymsModal} from './editSynonyms/EditSynonymsModal';
import {NewOrEditThesaurus} from './NewOrEditThesaurus';
import {DeleteThesaurus} from './DeleteThesaurus';
import {Import} from './Import';
import {useThesauriState} from './useThesauriState';


export function Thesauri({
	licenseValid,
	servicesBaseUrl,
	setLicensedTo,
	setLicenseValid
} :{
	licenseValid :boolean
	servicesBaseUrl :string
	setLicensedTo :SetLicensedToFunction,
	setLicenseValid :SetLicenseValidFunction
}) {
	const {
		durationSinceLastUpdate,
		editSynonymsModalState,
		isLoading,
		locales,
		memoizedFetchOnUpdate,
		newOrEditState,
		setEditSynonymsModalState,
		setNewOrEditState,
		setShowDelete,
		showDelete,
		synonymsSum,
		thesauriRes,
		thesaurusNames
	} = useThesauriState({
		servicesBaseUrl
	});
	return <>
		<Segment className='page' basic>
			<Grid>
				<Grid.Column floated='left' width={3}>
					<Table basic collapsing compact>
						<Table.Body>
							<Table.Row verticalAlign='middle'>
								<Table.Cell collapsing>
									<Radio
										label={"Show delete"}
										checked={showDelete}
										onChange={(
											//@ts-ignore error TS6133: 'event' is declared but its value is never read.
											event :unknown,
											{checked}
										) => {
											setShowDelete(checked);
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
						onClick={memoizedFetchOnUpdate}><Icon className='refresh'/>Last updated: {durationSinceLastUpdate}</Button>
				</Grid.Column>
			</Grid>
		</Segment>
		<Header
			as='h1'
			disabled={isLoading}
		>Synonyms</Header>
		{/*<Dimmer.Dimmable dimmed={isLoading}>
			<Dimmer active={isLoading} inverted>
				<Loader size='large'>Loading</Loader>
			</Dimmer>*/}
		<Table celled compact collapsing selectable sortable striped attached='top'>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Options</Table.HeaderCell>
					<Table.HeaderCell>Name</Table.HeaderCell>
					<Table.HeaderCell>Languages</Table.HeaderCell>
					<Table.HeaderCell>Synonyms</Table.HeaderCell>
					<Table.HeaderCell>Count</Table.HeaderCell>
					<Table.HeaderCell>Actions</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{(() => {
					//console.debug(thesauriRes);
					return thesauriRes.hits.map(({
						//description,
						_id,
						_name,
						allowedLanguages,
						synonymsCount
					}, index) => {
						return <Table.Row disabled={isLoading} key={index}>
							<Table.Cell collapsing>
								<Popup
									content={`Edit thesaurus ${_name}`}
									inverted
									trigger={<Button
										disabled={isLoading}
										icon
										loading={isLoading}
										onClick={() => {
											setNewOrEditState({
												_id,
												open: true
											});
										}}
									><Icon color='blue' name='options'/></Button>}
								/>
							</Table.Cell>
							<Table.Cell collapsing>{_name}</Table.Cell>
							<Table.Cell collapsing>{allowedLanguages.join(', ')}</Table.Cell>
							<Table.Cell collapsing>
								<Popup
									content={`Edit ${_name} synonyms`}
									inverted
									trigger={<Button
										disabled={isLoading}
										icon
										loading={isLoading}
										onClick={() => {
											setEditSynonymsModalState({
												_id,
												_name,
												open: true
											});
										}}
									><Icon color='blue' name='code branch'/></Button>}
								/>
							</Table.Cell>
							<Table.Cell collapsing>{synonymsCount}</Table.Cell>
							<Table.Cell collapsing>
								<Button.Group>
									<Import
										name={_name}
										afterClose={memoizedFetchOnUpdate}
										disabled={isLoading}
										loading={isLoading}
										servicesBaseUrl={servicesBaseUrl}
									/>
									<Popup
										content={`Export from thesaurus ${_name}`}
										inverted
										trigger={<Button
											as='a'
											disabled={isLoading}
											icon
											loading={isLoading}
											href={`${servicesBaseUrl}/thesaurusExport?name=${_name}`}
										><Icon color='blue' name='download'/></Button>}
									/>
									{showDelete ? <DeleteThesaurus
										_id={_id}
										afterClose={memoizedFetchOnUpdate}
										disabled={isLoading}
										loading={isLoading}
										name={_name}
										servicesBaseUrl={servicesBaseUrl}
									/> : null}
								</Button.Group>
							</Table.Cell>
						</Table.Row>;
					});
				})()}
			</Table.Body>
			<Table.Footer>
				<Table.Row disabled={isLoading}>
					<Table.HeaderCell></Table.HeaderCell>
					<Table.HeaderCell></Table.HeaderCell>
					<Table.HeaderCell></Table.HeaderCell>
					<Table.HeaderCell>
						<Popup
							content='Edit all synonyms'
							inverted
							trigger={<Button
								disabled={isLoading}
								icon
								loading={isLoading}
								onClick={() => {
									setEditSynonymsModalState({
										_id: undefined,
										_name: undefined,
										open: true
									});
								}}
							><Icon color='blue' name='code branch'/></Button>}
						/>
					</Table.HeaderCell>
					<Table.HeaderCell className={isLoading ? 'disabled' : ''}>
						{synonymsSum}
					</Table.HeaderCell>
					<Table.HeaderCell></Table.HeaderCell>
				</Table.Row>
			</Table.Footer>
		</Table>
		{/*</Dimmer.Dimmable>*/}
		<Button
			circular
			color='green'
			disabled={isLoading}
			icon
			loading={isLoading}
			onClick={() => {
				setNewOrEditState({
					_id: undefined,
					open: true
				});
			}}
			size='massive'
			style={{
				bottom: 13.5,
				position: 'fixed',
				right: 13.5
			}}><Icon
				name='plus'
			/></Button>
		<NewOrEditThesaurus
			_id={newOrEditState._id}
			open={newOrEditState.open}
			licenseValid={licenseValid}
			locales={locales}
			afterClose={memoizedFetchOnUpdate}
			servicesBaseUrl={servicesBaseUrl}
			setNewOrEditState={setNewOrEditState}
			setLicensedTo={setLicensedTo}
			setLicenseValid={setLicenseValid}
			thesaurusNames={thesaurusNames}
		/>
		<EditSynonymsModal
			open={editSynonymsModalState.open}
			afterClose={memoizedFetchOnUpdate}
			locales={locales}
			servicesBaseUrl={servicesBaseUrl}
			setEditSynonymsModalState={setEditSynonymsModalState}
			thesaurusId={editSynonymsModalState._id}
			thesaurusName={editSynonymsModalState._name}
		/>
	</>;
} // Thesauri
