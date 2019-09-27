import {Header, Table} from 'semantic-ui-react';

import {DeleteModal} from './stopWords/DeleteModal';
import {NewOrEditModal} from './stopWords/NewOrEditModal';


export class StopWords extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			stopWordsRes: {
				count: 0,
				hits: [],
				total: 0
			},
			isLoading: false
		};
	} // constructor


	updateStopwords() {
		this.setState({ isLoading: true });
		fetch(`${this.props.servicesBaseUrl}/stopWordsList`)
			.then(response => response.json())
			.then(data => this.setState({
				stopWordsRes: data,
				isLoading: false
			}));
	}


	componentDidMount() {
		this.updateStopwords();
	} // componentDidMount


	render() {
		const {servicesBaseUrl} = this.props;
		const {stopWordsRes} = this.state;
		return <>
			<Header as='h1' content='Stop words'/>
			<Table celled collapsing compact selectable singleLine sortable striped>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Name</Table.HeaderCell>
						<Table.HeaderCell>Count</Table.HeaderCell>
						<Table.HeaderCell>Words</Table.HeaderCell>
						<Table.HeaderCell>Actions</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{stopWordsRes.hits.map(({displayName, name, words}, index) => {
						const key = `list[${index}]`;
						return <Table.Row key={key}>
							<Table.Cell collapsing>{displayName}</Table.Cell>
							<Table.Cell collapsing>{words.length}</Table.Cell>
							<Table.Cell collapsing>{words.join(', ')}</Table.Cell>
							<Table.Cell collapsing>
								<NewOrEditModal
									afterClose={() => this.updateStopwords()}
									displayName={displayName}
									name={name}
									servicesBaseUrl={servicesBaseUrl}
									words={words}
								/>
								<DeleteModal
									afterClose={() => this.updateStopwords()}
									name={name}
									servicesBaseUrl={servicesBaseUrl}
								/>
							</Table.Cell>
						</Table.Row>;
					})}
				</Table.Body>
			</Table>
			<NewOrEditModal
				afterClose={() => this.updateStopwords()}
				servicesBaseUrl={servicesBaseUrl}
			/>
		</>;
	} // render
} // class StopWords
