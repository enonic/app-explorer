import Uri from 'jsuri';
import {
	Button, Dropdown, Form, Header, Icon, Input, Loader, Modal, Pagination,
	Segment, Table
} from 'semantic-ui-react';

import {Form as EnonicForm} from './enonic/Form';
import {Input as EnonicInput} from './enonic/Input';
import {InsertButton} from './enonic/InsertButton';
import {MoveDownButton} from './enonic/MoveDownButton';
import {MoveUpButton} from './enonic/MoveUpButton';
import {ResetButton} from './enonic/ResetButton';
import {SubmitButton} from './enonic/SubmitButton';


function required(value) {
	return value ? undefined : 'Required!';
}


function NewOrEditThesaurus(props) {
	const {
		id,
		displayName = '',
		name = '',
		onClose,
		servicesBaseUrl
	} = props;

	const [open, setOpen] = React.useState(false);

	function doOpen() { setOpen(true); }
	function doClose() {
		onClose();
		setOpen(false);
	}

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
			<EnonicForm
				initialValues={{
					name,
					displayName
				}}
				onSubmit={({
					name,
					displayName
				}) => {
					fetch(`${servicesBaseUrl}/thesaurus${id ? 'Update' : 'Create'}?displayName=${displayName}${id ? `&id=${id}` : ''}&name=${name}`, {
						method: 'POST'
					}).then(response => {
						doClose();
					})
				}}
				schema={{
					displayName: (value) => required(value),
					name: (value) => required(value)
				}}
			>
				{!id && <Form.Field>
					<EnonicInput
						fluid
						label={{basic: true, content: 'Name'}}
						path='name'
						placeholder='Please input name'
					/>
				</Form.Field>}
				<Form.Field>
					<EnonicInput
						fluid
						label={{basic: true, content: 'Display name'}}
						path='displayName'
						placeholder='Please input display name'
					/>
				</Form.Field>
				<SubmitButton/>
				<ResetButton/>
			</EnonicForm>
		</Modal.Content>
	</Modal>;
} // NewOrEditThesaurus


function DeleteThesaurus(props) {
	const {
		onClose,
		id,
		name,
		servicesBaseUrl
	} = props;
	const [open, setOpen] = React.useState(false);
	function doOpen() { setOpen(true); }
	function doClose() {
		onClose();
		setOpen(false);
	}
	return <Modal
		closeIcon
		onClose={doClose}
		open={open}
		trigger={<Button
			compact
			onClick={() => setOpen(true)}
			size='tiny'><Icon color='red' name='trash alternate outline'/>Delete</Button>}
	>
		<Modal.Header>Delete thesaurus {name}</Modal.Header>
		<Modal.Content>
			<Header as='h2'>Do you really want to delete {name}?</Header>
			<Button
				compact
				onClick={() => {
					fetch(`${servicesBaseUrl}/thesaurusDelete?id=${id}&name=${name}`, {
						method: 'DELETE'
					}).then(response => {
						doClose();
					})
				}}
				size='tiny'
			><Icon color='red' name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Content>
	</Modal>;
} // DeleteThesaurus


function Import(props) {
	const {
		name,
		onClose,
		servicesBaseUrl,
		TOOL_PATH
	} = props;
	const [open, setOpen] = React.useState(false);
	function doOpen() { setOpen(true); }
	function doClose() {
		onClose();
		setOpen(false);
	}
	return <Modal
		closeIcon
		onClose={doClose}
		open={open}
		trigger={<Button
			compact
			onClick={() => setOpen(true)}
			size='tiny'><Icon color='blue' name='upload'/> Import csv</Button>}
	>
		<Modal.Header>Import to thesaurus {name}</Modal.Header>
		<Modal.Content>
			<Form>
				<Form.Field>
					<Input
						accept='text/csv'
						name='file'
						id='file'
						type='file'
					/>
				</Form.Field>
				<Button
					compact
					onClick={() => {
						const body = new FormData();
						const fileInput = document.querySelector('#file') ;
						console.debug('fileInput', fileInput);
						body.append('name', name);
						body.append('file', fileInput.files[0]);
						fetch(`${servicesBaseUrl}/thesaurusImport`, {
							body,
							method: 'POST'
						}).then(response => {
							doClose();
						})
					}}
					size='tiny'
					type='submit'
				><Icon color='green' name='upload'/>Import to thesaurus {name}</Button>
			</Form>
		</Modal.Content>
	</Modal>;
} // Import


function NewOrEditSynonym(props) {
	const {
		id,
		onClose,
		servicesBaseUrl,
		thesaurusId
	} = props;
	const [open, setOpen] = React.useState(false);
	function doOpen() { setOpen(true); }
	function doClose() {
		onClose();
		setOpen(false);
	}
	const from = ['a', 'b', 'c'];
	const to = [''];
	return <Modal
		closeIcon
		onClose={doClose}
		open={open}
		trigger={id ? <Button
			compact
			onClick={() => setOpen(true)}
			size='tiny'><Icon color='blue' name='edit'/> Edit synonym</Button>
			: <Button
				compact
				onClick={() => setOpen(true)}
				size='tiny'><Icon color='green' name='plus'/> New synonym</Button>
		}
	>
		<Modal.Header>{id ? `Edit synonym ${id}` : `New synonym`}</Modal.Header>
		<Modal.Content>
			<EnonicForm
				initialValues={{
					from,
					to
				}}
				onSubmit={({
					from,
					to
				}) => {
					console.debug({from, to});
				}}
			>
				<Header as='h2'>From</Header>
				{from.map((fromValue, fromIndex) => {
					const fromPath = `from.${fromIndex}`;
					return <React.Fragment key={fromPath}>
						<EnonicInput
							fluid
							path={fromPath}
						/>
						<InsertButton
							path='from'
							index={fromIndex}
							value={'inserted'}
						/>
						<MoveDownButton
							disabled={fromIndex + 1 >= from.length}
							path='from'
							index={fromIndex}
						/>
						<MoveUpButton
							path='from'
							index={fromIndex}
						/>
					</React.Fragment>
				})}
				<Header as='h2'>To</Header>
				{to.map((toValue, toIndex) => {
					const toPath = `to.${toIndex}`;
					return <EnonicInput
						fluid
						key={toPath}
						path={toPath}
					/>
				})}
				<SubmitButton/>
				<ResetButton/>
			</EnonicForm>
		</Modal.Content>
	</Modal>;
} // NewOrEditSynonym


export class EditThesauri extends React.Component {
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
		return <>
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
			</Segment>
		</>;
	} // render
} // class EditThesauri


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
									thesaurusId={id}
									onClose={fetchThesauri}
									servicesBaseUrl={servicesBaseUrl}
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
						<Table.HeaderCell></Table.HeaderCell>
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
		serviceUrl,
		servicesBaseUrl,
		TOOL_PATH
	} = props;
	return <>
		<Header as='h1'>Thesauri</Header>
		<ThesauriList
			servicesBaseUrl={servicesBaseUrl}
			TOOL_PATH={TOOL_PATH}
		/>
		<Header as='h2'>All synonyms</Header>
		<EditThesauri
			serviceUrl={serviceUrl}
			TOOL_PATH={TOOL_PATH}
		/>
	</>;
}
