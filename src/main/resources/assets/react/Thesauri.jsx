import Uri from 'jsuri';
import {
	Button, Dropdown, Form, Header, Icon, Input, Loader, Modal, Pagination,
	Rail, Ref, Segment, Sticky, Table
} from 'semantic-ui-react';
import {createRef} from 'react';


function NewOrEdit(props) {
	const {
		id,
		servicesBaseUrl
	} = props;

	const [displayName, setDisplayName] = React.useState(props.displayName || '');
	const [name, setName] = React.useState(props.name || '');
	const [open, setOpen] = React.useState(false);

	function doOpen() { setOpen(true); }
	function doClose() { setOpen(false); }

	return <Modal
		closeIcon
		onClose={doClose}
		open={open}
		trigger={id ? <Button
			compact
			onClick={doOpen}
			size='tiny'
		><Icon color='blue' name='edit'/>Edit</Button>
			: <Button
				circular
				color='green'
				icon
				onClick={doOpen}
				size='massive'
				style={{
					bottom: 13.5,
					position: 'fixed',
					right: 13.5
				}}><Icon
					name='plus'
				/></Button>}
	>
		<Modal.Header>{id ? `Edit thesaurus ${displayName}` : 'New thesaurus'}</Modal.Header>
		<Modal.Content>
			<Form>
				{!id && <Form.Field>
					<Input
						fluid
						label={{basic: true, content: 'Name'}}
						name='name'
						onChange={(e, {value}) => {
							setName(value);
						}}
						placeholder='Please input name'
						value={name}
					/>
				</Form.Field>}
				<Form.Field>
					<Input
						fluid
						label={{basic: true, content: 'Display name'}}
						name='displayName'
						onChange={(e, {value}) => {
							setDisplayName(value);
						}}
						placeholder='Please input display name'
						value={displayName}
					/>
				</Form.Field>
				<Button
					onClick={() => {
						fetch(`${servicesBaseUrl}/thesaurus${id ? 'Update' : 'Create'}?displayName=${displayName}${id ? `&id=${id}` : `&name=${name}`}`, {
							method: 'POST'
						}).then(response => {
							doClose();
						})
					}}
					type='submit'>{id ? 'Save' : 'Create'}</Button>
				<Button
					onClick={() => {
						setDisplayName(props.displayName || '');
						setName(props.name || '');
					}}
					type='reset'>Reset</Button>
			</Form>
		</Modal.Content>
	</Modal>;
} // NewOrEdit


export class EditThesauri extends React.Component {
	contextRef = createRef();

	constructor(props) {
		super(props);

		this.state = {
			data: {
				queryResult: {
					aggregations: {
						thesaurus: {
							buckets: []
						}
					},
					count: 0,
					hits: [],
					page: 1,
					start: 1,
					end: 1,
					totalPages: 0,
					total: 0
				}
			},
			params: {
				from: '',
				perPage: 10,
				page: 1,
				query: '',
				sort: 'from ASC',
				thesauri: props.thesauri || [],
				to: ''
			}
		};
		this.changeParam = this.changeParam.bind(this);
		this.search();
	} // constructor


	search() {
		const {serviceUrl, TOOL_PATH} = this.props;
		const {params} = this.state;
		const uri = new Uri(serviceUrl);
		Object.entries(params).forEach(([k, v]) => {
			//console.debug({k, v});
			uri.replaceQueryParam(k, v);
		});
		const uriStr = uri.toString();
		fetch(uriStr)
			.then(response => response.json())
			.then(data => {
				this.setState({data});
			})
	} // search


	async changeParam({name, value}) {
		await this.setState(prevState => {
			prevState.params[name] = value;
			if (name !== 'page') {
				prevState.params.page = 1;
			}
			return prevState;
		});
		this.search();
	} // changeParam


	render() {
		const {TOOL_PATH} = this.props;
		const {
			data: {
				queryResult: {
					aggregations,
					end,
					hits,
					page,
					start,
					total,
					totalPages
				}
			},
			params: {
				from,
				perPage,
				sort,
				thesauri,
				to
			}
		} = this.state;
		//console.debug(hits);
		return <Ref innerRef={this.contextRef}>
			<Segment basic style={{padding: 0}}>
				<Table celled compact selectable sortable striped attached='top'>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>From</Table.HeaderCell>
							<Table.HeaderCell>To</Table.HeaderCell>
							<Table.HeaderCell>Thesaurus</Table.HeaderCell>
							<Table.HeaderCell>Score</Table.HeaderCell>
							<Table.HeaderCell></Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{hits.map(({from, name, score, thesaurus, to}, i) => <Table.Row key={i}>
							<Table.Cell>{(Array.isArray(from) ? from : [from]).join(', ')}</Table.Cell>
							<Table.Cell>{(Array.isArray(to) ? to : [to]).join(', ')}</Table.Cell>
							<Table.Cell>{thesaurus}</Table.Cell>
							<Table.Cell>{score}</Table.Cell>
							<Table.Cell>
								<Button.Group>
									<a className="ui button" href={`${TOOL_PATH}/thesauri/synonyms/${thesaurus}/edit/${name}`}><i className="blue edit icon"></i> Edit</a>
									<a className="ui button" href={`${TOOL_PATH}/thesauri/synonyms/${thesaurus}/delete/${name}`}><i className="red trash alternate outline icon"></i> Delete</a>
								</Button.Group>
							</Table.Cell>
						</Table.Row>)}
					</Table.Body>
				</Table>
				<Pagination
					attached='bottom'
					fluid
					size='mini'

					activePage={page}
					boundaryRange={1}
					siblingRange={1}
					totalPages={totalPages}

					ellipsisItem={{content: <Icon name='ellipsis horizontal' />, icon: true}}
					firstItem={{content: <Icon name='angle double left' />, icon: true}}
					prevItem={{content: <Icon name='angle left' />, icon: true}}
					nextItem={{content: <Icon name='angle right' />, icon: true}}
					lastItem={{content: <Icon name='angle double right' />, icon: true}}

					onPageChange={(e,{activePage}) => this.changeParam({name: 'page', value: activePage})}
				/>
				<p>Displaying {start}-{end} of {total}</p>
				<Rail position='left'>
					<Sticky context={this.contextRef} offset={14}>
						<Segment basic>
							<Form>
								<Header as='h4'><Icon name='filter'/> Filter</Header>
								<Form.Field>
									<input
										fluid='true'
										label='From'
										onChange={({target:{value}}) => this.changeParam({name: 'from', value})}
										placeholder='From'
										value={from}
									/>
								</Form.Field>
								<Form.Field>
									<input
										fluid='true'
										label='To'
										onChange={({target:{value}}) => this.changeParam({name: 'to', value})}
										placeholder='To'
										value={to}
									/>
								</Form.Field>
							</Form>
						</Segment>
					</Sticky>
				</Rail>
				<Rail position='right'>
					<Sticky context={this.contextRef} offset={14}>
						<Segment basic>
							<Form>
								<Header as='h4'><Icon name='font'/> Thesauri</Header>
								<Dropdown
									defaultValue={thesauri}
									fluid
									multiple={true}
									name='thesauri'
									onChange={(e, {value}) => this.changeParam({name: 'thesauri', value})}
									options={aggregations.thesaurus.buckets.map(({key, docCount}) => {
										const tName = key.replace('/thesauri/', '');
										return {
											key: tName,
											text: `${tName} (${docCount})`,
											value: tName
										};
									})}
									search
									selection
								/>
								<Header as='h4'><Icon name='resize vertical'/> Per page</Header>
								<Form.Field>
									<Dropdown
										defaultValue={perPage}
										fluid
										onChange={(e,{value}) => this.changeParam({name: 'perPage', value})}
										options={[5,10,25,50,100].map(key => ({key, text: `${key}`, value: key}))}
										selection
									/>
								</Form.Field>
								<Header as='h4'><Icon name='sort'/> Sort</Header>
								<Form.Field>
									<Dropdown
										defaultValue={sort}
										fluid
										onChange={(e,{value}) => this.changeParam({name: 'sort', value})}
										options={[{
											key: '_score DESC',
											text: 'Score descending',
											value: '_score DESC'
										}, {
											key: 'from ASC',
											text: 'From ascending',
											value: 'from ASC'
										}]}
										selection
									/>
								</Form.Field>
							</Form>
						</Segment>
					</Sticky>
				</Rail>
			</Segment>
		</Ref>;
	} // render
} // class EditThesauri


export function Thesauri(props) {
	//console.debug('Thesauri props', props);
	const {servicesBaseUrl} = props;

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
								<NewOrEdit
									displayName={displayName}
									id={id}
									name={name}
									servicesBaseUrl={servicesBaseUrl}
								/>
							</Table.Cell>
						</Table.Row>
					})}
				</Table.Body>
				<Table.Footer>
					<Table.Row>
						<Table.HeaderCell></Table.HeaderCell>
						<Table.HeaderCell>{synonymsSum}</Table.HeaderCell>
						<Table.HeaderCell></Table.HeaderCell>
					</Table.Row>
				</Table.Footer>
			</Table>}
		<NewOrEdit
			servicesBaseUrl={servicesBaseUrl}
		/>
	</>;
} // Thesauri
