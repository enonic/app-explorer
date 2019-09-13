import {Button, Header, Icon, Loader, Table} from 'semantic-ui-react';

import {EditSynonyms} from './thesaurus/EditSynonyms';
import {NewOrEditSynonym} from './thesaurus/NewOrEditSynonym';
import {NewOrEditThesaurus} from './thesaurus/NewOrEditThesaurus';
import {DeleteThesaurus} from './thesaurus/DeleteThesaurus';
import {Import} from './thesaurus/Import';


export function ThesauriList(props) {
	//console.debug('Thesauri props', props);
	const {
		servicesBaseUrl,
		TOOL_PATH
	} = props;

	const [isLoading, setLoading] = React.useState(false);
	const [thesauriRes, setThesauriRes] = React.useState({
		count: 0,
		hits: [],
		total: 0
	});
	const [synonymsSum, setSynonymsSum] = React.useState(0);

	function fetchThesauri() {
		setLoading(true);
		fetch(`${servicesBaseUrl}/thesaurusList`)
			.then(response => response.json())
			.then(data => {
				//console.debug('fetchThesauri data', data);
				let sum = data.total ? data.hits
					.map(({synonymsCount}) => synonymsCount)
					.reduce((accumulator, currentValue) => accumulator + currentValue) : 0
				setThesauriRes(data);
				setSynonymsSum(sum);
				setLoading(false);
			});
	}

	React.useEffect(() => fetchThesauri(), []);

	return <>
		{isLoading
			? <Loader active inverted>Loading</Loader>
			: <Table celled compact selectable sortable striped attached='top'>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Display name</Table.HeaderCell>
						<Table.HeaderCell>Synonyms</Table.HeaderCell>
						<Table.HeaderCell>Actions</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{thesauriRes.hits.map(({
						//description,
						displayName,
						id,
						name,
						synonymsCount
					}, index) => {
						return <Table.Row key={index}>
							<Table.Cell>{displayName}</Table.Cell>
							<Table.Cell>{synonymsCount}</Table.Cell>
							<Table.Cell>
								<NewOrEditSynonym
									onClose={fetchThesauri}
									servicesBaseUrl={servicesBaseUrl}
									thesaurusId={id}
								/>
								<EditSynonyms
									onClose={fetchThesauri}
									servicesBaseUrl={servicesBaseUrl}
									thesaurusId={id}
									thesaurusName={name}
								/>
								<NewOrEditThesaurus
									displayName={displayName}
									id={id}
									name={name}
									onClose={fetchThesauri}
									servicesBaseUrl={servicesBaseUrl}
								/>
								<DeleteThesaurus
									id={id}
									name={name}
									onClose={fetchThesauri}
									servicesBaseUrl={servicesBaseUrl}
								/>
								<Import
									name={name}
									onClose={fetchThesauri}
									servicesBaseUrl={servicesBaseUrl}
									TOOL_PATH={TOOL_PATH}
								/>
								<Button
									as='a'
									compact
									href={`${TOOL_PATH}/thesauri/export/${name}.csv`}
									size='tiny'
								><Icon color='blue' name='download'/>{`${name}.csv`}</Button>
							</Table.Cell>
						</Table.Row>
					})}
				</Table.Body>
				<Table.Footer>
					<Table.Row>
						<Table.HeaderCell></Table.HeaderCell>
						<Table.HeaderCell>{synonymsSum}</Table.HeaderCell>
						<Table.HeaderCell>
							<EditSynonyms
								onClose={fetchThesauri}
								servicesBaseUrl={servicesBaseUrl}
							/>
						</Table.HeaderCell>
					</Table.Row>
				</Table.Footer>
			</Table>}
		<NewOrEditThesaurus
			onClose={fetchThesauri}
			servicesBaseUrl={servicesBaseUrl}
		/>
	</>;
} // ThesauriList


export function Thesauri(props) {
	//console.debug('Thesauri props', props);
	const {
		servicesBaseUrl,
		TOOL_PATH
	} = props;
	return <>
		<Header as='h1'>Thesauri</Header>
		<ThesauriList
			servicesBaseUrl={servicesBaseUrl}
			TOOL_PATH={TOOL_PATH}
		/>
	</>;
}
