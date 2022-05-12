import type {
	SetLicensedToFunction,
	SetLicenseValidFunction
} from '../index.d';

//import {getIn} from '@enonic/js-utils';
import {
	Button, Dimmer, Header, Icon, Loader, Popup, Radio, Segment, Table
} from 'semantic-ui-react';

import {EditSynonymsModal} from './EditSynonymsModal';
//import {NewOrEditSynonym} from './NewOrEditSynonym';
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
		isLoading,
		locales,
		memoizedFetchOnUpdate,
		setShowDelete,
		showDelete,
		synonymsSum,
		thesauriRes,
		thesaurusNames
	} = useThesauriState({
		servicesBaseUrl
	});
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
		</Segment>
		<Header as='h1'>Synonyms</Header>
		<Dimmer.Dimmable dimmed={isLoading}>
			<Table celled collapsing compact selectable sortable striped attached='top'>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Options</Table.HeaderCell>
						<Table.HeaderCell>Name</Table.HeaderCell>
						<Table.HeaderCell>From Language</Table.HeaderCell>
						<Table.HeaderCell>To Language</Table.HeaderCell>
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
							language,/* = {  // This doesn't help when null is passed in! Happens when execute is surrounded with JSON.stringify
								from: '',
								to: ''
							},*/
							synonymsCount
						}, index) => {
							if (!language) { language = {
								from: '',
								to: ''
							};}
							const {from,to} = language;
							return <Table.Row key={index}>
								<Table.Cell collapsing>
									<NewOrEditThesaurus
										_id={_id}
										_name={_name}
										afterClose={memoizedFetchOnUpdate}
										language={language}
										licenseValid={licenseValid}
										locales={locales}
										servicesBaseUrl={servicesBaseUrl}
										setLicensedTo={setLicensedTo}
										setLicenseValid={setLicenseValid}
										thesaurusNames={thesaurusNames}
									/>
								</Table.Cell>
								<Table.Cell collapsing>{_name}</Table.Cell>
								<Table.Cell collapsing>{from}</Table.Cell>
								<Table.Cell collapsing>{to}</Table.Cell>
								<Table.Cell collapsing><EditSynonymsModal
									locales={locales}
									afterClose={memoizedFetchOnUpdate}
									servicesBaseUrl={servicesBaseUrl}
									thesaurusId={_id}
									thesaurusName={_name}
								/></Table.Cell>
								<Table.Cell collapsing>{synonymsCount}</Table.Cell>
								<Table.Cell collapsing>
									<Button.Group>
										{/*<NewOrEditSynonym
											afterClose={fetchOnUpdate}
											servicesBaseUrl={servicesBaseUrl}
											thesaurusId={_id}
										/>*/}
										{/*<EditSynonymsModal
											afterClose={fetchOnUpdate}
											servicesBaseUrl={servicesBaseUrl}
											thesaurusId={_id}
											thesaurusName={_name}
										/>*/}
										<Import
											name={_name}
											afterClose={memoizedFetchOnUpdate}
											servicesBaseUrl={servicesBaseUrl}
										/>
										<Popup
											content={`Export from thesaurus ${_name}`}
											inverted
											trigger={<Button
												as='a'
												icon
												href={`${servicesBaseUrl}/thesaurusExport?name=${_name}`}
											><Icon color='blue' name='download'/></Button>}
										/>
										{showDelete ? <DeleteThesaurus
											_id={_id}
											name={_name}
											afterClose={memoizedFetchOnUpdate}
											servicesBaseUrl={servicesBaseUrl}
										/> : null}
									</Button.Group>
								</Table.Cell>
							</Table.Row>;
						});
					})()}
				</Table.Body>
				<Table.Footer>
					<Table.Row>
						<Table.HeaderCell></Table.HeaderCell>
						<Table.HeaderCell></Table.HeaderCell>
						<Table.HeaderCell></Table.HeaderCell>
						<Table.HeaderCell></Table.HeaderCell>
						<Table.HeaderCell><EditSynonymsModal
							locales={locales}
							afterClose={memoizedFetchOnUpdate}
							servicesBaseUrl={servicesBaseUrl}
						/></Table.HeaderCell>
						<Table.HeaderCell>{synonymsSum}</Table.HeaderCell>
						<Table.HeaderCell></Table.HeaderCell>
					</Table.Row>
				</Table.Footer>
			</Table>
			<Dimmer active={isLoading} inverted><Loader size='massive'>Loading</Loader></Dimmer>
		</Dimmer.Dimmable>
		<NewOrEditThesaurus
			language={{from: '', to: ''}}
			licenseValid={licenseValid}
			locales={locales}
			afterClose={memoizedFetchOnUpdate}
			servicesBaseUrl={servicesBaseUrl}
			setLicensedTo={setLicensedTo}
			setLicenseValid={setLicenseValid}
			thesaurusNames={thesaurusNames}
		/>
	</>;
} // Thesauri
