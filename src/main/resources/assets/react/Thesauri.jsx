//import getIn from 'get-value';
import {
	Button, Header, Icon, Label, Loader, Popup, Radio, Segment, Table
} from 'semantic-ui-react';

import {EditSynonymsModal} from './thesaurus/EditSynonymsModal';
//import {NewOrEditSynonym} from './thesaurus/NewOrEditSynonym';
import {NewOrEditThesaurus} from './thesaurus/NewOrEditThesaurus';
import {DeleteThesaurus} from './thesaurus/DeleteThesaurus';
import {Import} from './thesaurus/Import';

/*const GQL_FIELD_QUERY = `{
	queryFields(fields: "language") {
		total
		count
		hits {
			_name
			key
		}
	}
}`;*/


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
	/*const [queryFieldsGraph, setQueryFieldsGraph] = React.useState({
		count: 0,
		hits: [],
		total: 0
	});*/
	const [showDelete, setShowDelete] = React.useState(false);
	const [synonymsSum, setSynonymsSum] = React.useState(0);
	const [thesauriRes, setThesauriRes] = React.useState({
		count: 0,
		hits: [],
		total: 0
	});
		//console.debug('Thesauri queryFieldsGraph', queryFieldsGraph);
	//const languageValues = getIn(queryFieldsGraph, ['hits', 0, 'values'], []);
	//console.debug('languageValues', languageValues);
	const languagesOptions = [{
		key: '_none',
		text: 'When no language is selected',
		value: '_none'
	},{
		key: '_any',
		text: 'Any language selected',
		value: '_any'
	}]/*.concat(languageValues.map(({
		_name: key,
		displayName:text
	}) => ({
		key,
		text,
		value: key
	})))*/;
	//console.debug('languagesOptions', languagesOptions);

	function fetchThesauri() {
		setLoading(true);
		fetch(`${servicesBaseUrl}/thesaurusList`)
			.then(response => response.json())
			.then(data => {
				//console.debug('fetchThesauri data', data);
				let sum = data.total ? data.hits
					.map(({synonymsCount}) => synonymsCount)
					.reduce((accumulator, currentValue) => accumulator + currentValue) : 0;
				setThesauriRes(data);
				setSynonymsSum(sum);
				setLoading(false);
			});
		/*fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: GQL_FIELD_QUERY })
		})
			.then(res => res.json())
			.then(res => {
				//console.log(res);
				if (res && res.data) {
					setQueryFieldsGraph(res.data.queryFields);
				}
			});*/
	} // fetchThesauri

	React.useEffect(() => fetchThesauri(), []);

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
								checked={showDelete}
								onChange={(ignored,{checked}) => {
									setShowDelete(checked);
								}}
								toggle
							/>
							<Label color='black' size='large'>Show delete</Label>
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>
		</Segment>
		<Header as='h1'>Synonyms</Header>
		{isLoading
			? <Loader active inverted>Loading</Loader>
			: <Table celled collapsing compact selectable sortable striped attached='top'>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Edit</Table.HeaderCell>
						<Table.HeaderCell>Name</Table.HeaderCell>
						<Table.HeaderCell>Languages</Table.HeaderCell>
						<Table.HeaderCell>Synonyms</Table.HeaderCell>
						<Table.HeaderCell>Actions</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{thesauriRes.hits.map(({
						//description,
						id,
						languages,// = ['_none', '_any'],
						name,
						synonymsCount
					}, index) => {
						return <Table.Row key={index}>
							<Table.Cell collapsing>
								<NewOrEditThesaurus
									id={id}
									languages={languages}
									languagesOptions={languagesOptions}
									licenseValid={licenseValid}
									name={name}
									onClose={fetchThesauri}
									servicesBaseUrl={servicesBaseUrl}
								/>
							</Table.Cell>
							<Table.Cell collapsing>{name}</Table.Cell>
							<Table.Cell collapsing>{languages.join(', ')}</Table.Cell>
							<Table.Cell collapsing>{synonymsCount}</Table.Cell>
							<Table.Cell collapsing>
								<Button.Group>
									{/*<NewOrEditSynonym
										onClose={fetchThesauri}
										servicesBaseUrl={servicesBaseUrl}
										thesaurusId={id}
									/>*/}
									{/*<EditSynonymsModal
										onClose={fetchThesauri}
										servicesBaseUrl={servicesBaseUrl}
										thesaurusId={id}
										thesaurusName={name}
									/>*/}
									<Import
										name={name}
										onClose={fetchThesauri}
										servicesBaseUrl={servicesBaseUrl}
									/>
									<Popup
										content={`Export from thesaurus ${name}`}
										inverted
										trigger={<Button
											as='a'
											icon
											href={`${servicesBaseUrl}/thesaurusExport?name=${name}`}
										><Icon color='blue' name='download'/></Button>}
									/>
									{showDelete ? <DeleteThesaurus
										id={id}
										name={name}
										onClose={fetchThesauri}
										servicesBaseUrl={servicesBaseUrl}
									/> : null}
								</Button.Group>
							</Table.Cell>
						</Table.Row>;
					})}
				</Table.Body>
				<Table.Footer>
					<Table.Row>
						<Table.HeaderCell><EditSynonymsModal
							onClose={fetchThesauri}
							servicesBaseUrl={servicesBaseUrl}
						/></Table.HeaderCell>
						<Table.HeaderCell></Table.HeaderCell>
						<Table.HeaderCell></Table.HeaderCell>
						<Table.HeaderCell>{synonymsSum}</Table.HeaderCell>
						<Table.HeaderCell></Table.HeaderCell>
					</Table.Row>
				</Table.Footer>
			</Table>}
		<NewOrEditThesaurus
			languages={['_none', '_any']}
			languagesOptions={languagesOptions}
			licenseValid={licenseValid}
			onClose={fetchThesauri}
			servicesBaseUrl={servicesBaseUrl}
			setLicensedTo={setLicensedTo}
			setLicenseValid={setLicenseValid}
		/>
	</>;
} // Thesauri
