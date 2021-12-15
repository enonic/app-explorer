//import getIn from 'get-value';
import {
	Button, Dimmer, Header, Icon, Label, Loader, Popup, Radio, Segment, Table
} from 'semantic-ui-react';

import {EditSynonymsModal} from './EditSynonymsModal';
//import {NewOrEditSynonym} from './NewOrEditSynonym';
import {NewOrEditThesaurus} from './NewOrEditThesaurus';
import {DeleteThesaurus} from './DeleteThesaurus';
import {Import} from './Import';


const GQL_LOCALES_GET = `getLocales {
	country
	#displayCountry
	#displayLanguage
	displayName
	#displayVariant
	#language
	tag
	#variant
}`;

const GQL_THESAURI_QUERY = `queryThesauri {
	total
	count
	hits {
		_id
		_name
		_nodeType
		_path
		#_versionKey
		description
		language {
			from
			to
		}
		synonymsCount
	}
}`;

const GQL_ON_MOUNT = `{
	${GQL_LOCALES_GET}
	${GQL_THESAURI_QUERY}
}`;

const GQL_ON_UPDATE = `{
	${GQL_THESAURI_QUERY}
}`;


export function Thesauri(props) {
	//console.debug('Thesauri props', props);
	const {
		licenseValid,
		servicesBaseUrl,
		setLicensedTo,
		setLicenseValid
	} = props;
	//console.debug('Thesauri licenseValid', licenseValid);

	const [isLoading, setLoading] = React.useState(false);
	const [locales, setLocales] = React.useState([]);
	const [showDelete, setShowDelete] = React.useState(false);
	const [synonymsSum, setSynonymsSum] = React.useState(0);
	const [thesauriRes, setThesauriRes] = React.useState({
		count: 0,
		hits: [],
		total: 0
	});

	function fetchOnMount() {
		setLoading(true);
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: GQL_ON_MOUNT })
		})
			.then(res => res.json())
			.then(res => {
				if (res && res.data) {
					setLocales(res.data.getLocales);
					setThesauriRes(res.data.queryThesauri);
					let sum = res.data.queryThesauri.total ? res.data.queryThesauri.hits
						.map(({synonymsCount}) => synonymsCount)
						.reduce((accumulator, currentValue) => accumulator + currentValue) : 0;
					setSynonymsSum(sum);
					setLoading(false);
				} // if
			}); // then
	} // fetchOnMount

	function fetchOnUpdate() {
		setLoading(true);
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: GQL_ON_UPDATE })
		})
			.then(res => res.json())
			.then(res => {
				if (res && res.data) {
					setThesauriRes(res.data.queryThesauri);
					let sum = res.data.queryThesauri.total ? res.data.queryThesauri.hits
						.map(({synonymsCount}) => synonymsCount)
						.reduce((accumulator, currentValue) => accumulator + currentValue) : 0;
					setSynonymsSum(sum);
					setLoading(false);
				} // if
			}); // then
	} // fetchOnUpdate

	React.useEffect(() => fetchOnMount(), []);

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
								onChange={(ignored,{checked}) => {
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
										language={language}
										licenseValid={licenseValid}
										locales={locales}
										afterClose={fetchOnUpdate}
										servicesBaseUrl={servicesBaseUrl}
									/>
								</Table.Cell>
								<Table.Cell collapsing>{_name}</Table.Cell>
								<Table.Cell collapsing>{from}</Table.Cell>
								<Table.Cell collapsing>{to}</Table.Cell>
								<Table.Cell collapsing><EditSynonymsModal
									locales={locales}
									afterClose={fetchOnUpdate}
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
											afterClose={fetchOnUpdate}
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
											afterClose={fetchOnUpdate}
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
							afterClose={fetchOnUpdate}
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
			afterClose={fetchOnUpdate}
			servicesBaseUrl={servicesBaseUrl}
			setLicensedTo={setLicensedTo}
			setLicenseValid={setLicenseValid}
		/>
	</>;
} // Thesauri
