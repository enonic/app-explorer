import type {
	SetLicensedToFunction,
	SetLicenseValidFunction
} from '../index.d';

//import {getIn} from '@enonic/js-utils';
import {
	Button,
	//Dimmer,
	Header,
	Icon,
	//Loader,
	Popup,
	Radio,
	Segment,
	Table
} from 'semantic-ui-react';
import HoverButton from '../components/buttons/HoverButton';
import RefreshButton from '../components/buttons/RefreshButton';
import Flex from '../components/Flex';
import {ExportThesaurusModal} from './exportThesaurus/ExportThesaurusModal';
import {EditSynonymsModal} from './editSynonyms/EditSynonymsModal';
import {NewOrEditThesaurus} from './newOrEditThesaurus/NewOrEditThesaurus';
import {DeleteThesaurus} from './DeleteThesaurus';
import {ImportThesaurusModal} from './importThesaurus/ImportThesaurusModal';
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
		editSynonymsModalState,
		exportDialogState,
		importDialogState,
		isLoading,
		locales,
		memoizedFetchOnUpdate,
		newOrEditState,
		setEditSynonymsModalState,
		setExportDialogState,
		setImportDialogState,
		setNewOrEditState,
		setShowAll,
		showAll,
		synonymsSum,
		thesauriRes,
		thesaurusNames
	} = useThesauriState({
		servicesBaseUrl
	});
	return <Flex
		className='mt-1rem'
		justifyContent='center'
	>
		<Flex.Item
			className={[
				'w-ma-fullExceptGutters',
				'w-mi-tabletExceptGutters-tabletUp',
				'w-fullExceptGutters-mobileDown',
			].join(' ')}
			overflowX='overlay'
		>
			<Flex
				justifyContent='space-between'
				gap
				marginBottom
			>
				<Flex.Item>
					<Segment className='button-padding'>
						<Radio
							label='Show all fields'
							checked={showAll}
							onChange={(
								_event :unknown,
								{checked}
							) => {
								setShowAll(checked);
							}}
							toggle
						/>
					</Segment>
				</Flex.Item>
				<Flex.Item>
					<RefreshButton
						loading={isLoading}
						onClick={memoizedFetchOnUpdate}
					/>
				</Flex.Item>
			</Flex>
			<Header
				as='h1'
				disabled={isLoading}
			>Synonyms</Header>
			{/*<Dimmer.Dimmable dimmed={isLoading}>
				<Dimmer active={isLoading} inverted>
					<Loader size='large'>Loading</Loader>
				</Dimmer>*/}
			<Table celled compact striped>
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
										trigger={
											<HoverButton
												color='blue'
												disabled={isLoading}
												icon='options'
												loading={isLoading}
												onClick={() => {
													setNewOrEditState({
														_id,
														_name,
														open: true
													});
												}}
											/>
										}
									/>
								</Table.Cell>
								<Table.Cell collapsing>{_name}</Table.Cell>
								<Table.Cell collapsing><ul style={{
									listStyleType: 'none',
									margin: 0,
									padding: 0
								}}>
									{allowedLanguages.map((lang, i) => <li key={i} style={{marginBottom: 3}}>{lang}</li>)}
								</ul></Table.Cell>
								<Table.Cell collapsing>
									<Popup
										content={`Edit ${_name} synonyms`}
										inverted
										trigger={
											<HoverButton
												color='blue'
												disabled={isLoading}
												icon='code branch'
												loading={isLoading}
												onClick={() => {
													setEditSynonymsModalState({
														_id,
														_name,
														open: true
													});
												}}
											/>
										}
									/>
								</Table.Cell>
								<Table.Cell collapsing>{synonymsCount}</Table.Cell>
								<Table.Cell collapsing>
									<Popup
										content={`Import to thesaurus ${_name}`}
										inverted
										trigger={
											<HoverButton
												color='blue'
												disabled={isLoading}
												icon='upload'
												loading={isLoading}
												onClick={() => {
													setImportDialogState({
														allowedLocales: locales.filter(({tag}) => {
															//console.debug('allowedLanguages:', allowedLanguages, ' tag:', tag);
															return allowedLanguages.includes(tag);
														}),
														open: true,
														thesaurusId: _id,
														thesaurusName: _name
													})
												}}
											/>
										}
									/>
									<Popup
										content={`Export from thesaurus ${_name}`}
										inverted
										trigger={
											<HoverButton
												color='blue'
												disabled={isLoading}
												icon='download'
												loading={isLoading}
												onClick={() => {
													setExportDialogState({
														allowedLocales: locales.filter(({tag}) => {
															//console.debug('allowedLanguages:', allowedLanguages, ' tag:', tag);
															return allowedLanguages.includes(tag);
														}),
														open: true,
														thesaurusName: _name
													})
												}}
											/>
										}
									/>
									{showAll ? <DeleteThesaurus
										_id={_id}
										afterClose={memoizedFetchOnUpdate}
										disabled={isLoading}
										loading={isLoading}
										name={_name}
										servicesBaseUrl={servicesBaseUrl}
									/> : null}
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
								trigger={
									<HoverButton
										color='blue'
										disabled={isLoading}
										icon='code branch'
										loading={isLoading}
										onClick={() => {
											setEditSynonymsModalState({
												_id: undefined,
												_name: undefined,
												open: true
											});
										}}
									/>
								}
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
						_name: undefined,
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
				_name={newOrEditState._name}
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
			<ImportThesaurusModal
				afterClose={memoizedFetchOnUpdate}
				allowedLocales={importDialogState.allowedLocales}
				open={importDialogState.open}
				servicesBaseUrl={servicesBaseUrl}
				setImportDialogState={setImportDialogState}
				thesaurusName={importDialogState.thesaurusName}
				thesaurusId={importDialogState.thesaurusId}
			/>
			<ExportThesaurusModal
				allowedLocales={exportDialogState.allowedLocales}
				open={exportDialogState.open}
				setExportDialogState={setExportDialogState}
				servicesBaseUrl={servicesBaseUrl}
				thesaurusName={exportDialogState.thesaurusName}
			/>
		</Flex.Item>
	</Flex>;
} // Thesauri
