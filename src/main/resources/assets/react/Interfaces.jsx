import {
	Button, Header, Icon, Input, Loader, Message, Modal, Table
} from 'semantic-ui-react';
import generateUuidv4 from 'uuid/v4';

import {Interface} from './Interface';


function NewOrEditModal(props) {
	const {
		collectionOptions,
		disabled = false,
		fields,
		initialValues = {},
		onClose,
		servicesBaseUrl,
		stopWordOptions,
		thesauriOptions
	} = props;
	//console.debug('initialValues', initialValues);

	const editMode = !!initialValues.id;

	const [isLoading, setLoading] = React.useState(false);
	const [node, setNode] = React.useState({
		collections: [],
		displayName: '',
		facets: [],
		filters: {},
		name: '',
		//query,
		resultMappings: [{
			field: '',
			highlight: false,
			join: true,
			lengthLimit: '',
			separator: ' ',
			to: '',
			uuid4: generateUuidv4()
		}],
		//stopWords,
		thesauri: []
	});
	const [open, setOpen] = React.useState(false);
	//console.debug('node', node);

	function fetchInterface() {
		setLoading(true);
		fetch(`${servicesBaseUrl}/interfaceGet?id=${initialValues.id}`)
			.then(response => response.json())
			.then(data => {
				setNode(data);
				setLoading(false);
			});
	} // fetchInterface

	function doOpen() {
		editMode && fetchInterface();
		setOpen(true);
	}

	function doClose() {
		onClose();
		setOpen(false);
	}

	//React.useEffect(() => fetchInterface(), []); // Once on init?

	return <Modal
		closeIcon
		onClose={doClose}
		open={open}
		size='large'
		trigger={editMode ? <Button
			compact
			disabled={disabled}
			onClick={doOpen}
			size='tiny'
		><Icon color='blue' name='edit'/>Edit</Button>
			: <Button
				circular
				color='green'
				disabled={disabled}
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
		<Modal.Header>{editMode ? `Edit interface ${initialValues.displayName}`: 'New interface'}</Modal.Header>
		<Modal.Content>
			{isLoading ? <Loader active inverted>Loading</Loader> : <Interface
				collectionOptions={collectionOptions}
				doClose={doClose}
				fields={fields}
				id={initialValues.id}
				name={initialValues.name}
				initialValues={node}
				servicesBaseUrl={servicesBaseUrl}
				stopWordOptions={stopWordOptions}
				thesauriOptions={thesauriOptions}
			/>}
		</Modal.Content>
	</Modal>;
} // NewOrEditModal


export class CopyModal extends React.Component {
	state = {
		interfaceExists: false,
		interfaceTo: '',
		open: false
	}

	open = () => this.setState({ open: true })

	close = () => this.setState({ open: false })

	render () {
		const {
			name,
			servicesBaseUrl,
			updateInterfaces
		} = this.props;
		const {
			interfaceExists,
			interfaceTo
		} = this.state;
		return <Modal
			closeIcon
			onClose={this.close}
			open={this.state.open}
			trigger={<Button onClick={this.open} compact size='tiny' type='button'><Icon color='green' name='copy'/>Copy</Button>}
		>
			<Modal.Header>Copy</Modal.Header>
			<Modal.Content>
				<Input
					error={interfaceExists}
					onChange={(event, {value}) => {
						fetch(`${servicesBaseUrl}/interfaceExists?name=${value}`)
							.then(response => response.json())
							.then(({exists}) => {
								//console.debug(exists);
								this.setState({
									interfaceExists: exists,
									interfaceTo: value
								});
							})
					}}
					placeholder='Please input name'
				/>
				{interfaceExists ? <Message
					icon='warning sign'
					header='Error'
					content='Interface name already in use!'
					negative
				/> : <Button
					onClick={() => {
						fetch(`${servicesBaseUrl}/interfaceCopy?from=${name}&to=${interfaceTo}`)
							.then(response => {
								if (response.status === 200) {
									updateInterfaces();
									this.close();
								}
							})
					}}
					type='button'
				><Icon color='green' name='copy'/>Copy</Button>}
			</Modal.Content>
		</Modal>
	}
} // class CopyModal


export class DeleteModal extends React.Component {
	state = {
		deleteNameMatches: false,
		open: false,
		typedInterfaceName: ''
	}

	open = () => this.setState({ open: true })

	close = () => {
		this.setState({ open: false });
		this.props.onClose();
	}

	render() {
		const {
			name,
			servicesBaseUrl
		} = this.props;
		const {
			deleteNameMatches,
			typedInterfaceName
		} = this.state;
		return <Modal
			closeIcon
			onClose={this.close}
			open={this.state.open}
			trigger={<Button
				compact
				onClick={this.open}
				size='tiny'
				type='button'
			><Icon color='red' name='trash alternate outline'/>Delete</Button>}
		>
			<Modal.Header>Delete</Modal.Header>
			<Modal.Content>
				<Input
					error={!deleteNameMatches}
					onChange={(event, {value}) => {
						//console.debug({name, value});
						this.setState({
							deleteNameMatches: name === value,
							typedInterfaceName: value
						});
					}}
					placeholder='Please input name'
					value={typedInterfaceName}
				/>
				{deleteNameMatches ? <Button
					compact
					onClick={() => {
						fetch(`${servicesBaseUrl}/interfaceDelete?name=${name}`, {
							method: 'POST'
						})
							.then(response => {
								if (response.status === 200) {
									this.close();
								}
							})
					}}
					type='button'
				><Icon color='red' name='trash alternate outline'/>Delete</Button> : <Message
					icon='warning sign'
					header='Error'
					content="Name doesn't match!"
					negative
				/>}
			</Modal.Content>
		</Modal>;
	}
} // class DeleteModal


export class Interfaces extends React.Component {
	constructor(props) {
		//console.debug('Interfaces constructor');
    	super(props);

    	this.state = {
			interfaceExists: false,
			interfaceTo: '',
      		//interfaces: this.props.interfaces || {},
			interfaces: {
				count: 0,
				hits: [],
				total: 0
			},
			isLoading: false
    	};
  	} // constructor


	updateInterfaces() {
		this.setState({ isLoading: true });
		fetch(`${this.props.servicesBaseUrl}/interfaceList`)
			.then(response => response.json())
			.then(data => this.setState({
				collectionOptions: data.collectionOptions,
				fields: data.fields,
				interfaces: data.interfaces,
				isLoading: false
			}));
	} // updateInterfaces


	componentDidMount() {
		//console.debug('Interfaces componentDidMount');
		this.updateInterfaces();
	} // componentDidMount


	render() {
		//console.debug('Interfaces render');
		//console.debug(this.props);
		//console.debug(this.state.interfaces);

		const {
			servicesBaseUrl,
			TOOL_PATH
		} = this.props;
		//console.debug(TOOL_PATH);

		const {
			collectionOptions,
			fields,
			interfaces: {
				hits
			},
			stopWordOptions,
			thesauriOptions
		} = this.state;
		//console.debug('fields', fields);
		//console.debug(hits);

		return <>
			<Header as='h1' content='Interfaces'/>
			<Table celled collapsing compact selectable singleLine striped>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Name</Table.HeaderCell>
						<Table.HeaderCell>Actions</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{hits.map((initialValues, index) => {
						const {displayName, id, name} = initialValues;
						//console.debug({displayName, name, index});
						return <Table.Row key={index}>
							<Table.Cell collapsing>{displayName}</Table.Cell>
							<Table.Cell collapsing>
								<Button.Group>
									<NewOrEditModal
										collectionOptions={collectionOptions}
										fields={fields}
										initialValues={initialValues}
										onClose={() => this.updateInterfaces()}
										servicesBaseUrl={servicesBaseUrl}
										stopWordOptions={stopWordOptions}
										thesauriOptions={thesauriOptions}
									/>
									<Button
										as='a'
										compact
										href={`${TOOL_PATH}/interfaces/search/${name}`}
										size='tiny'
										type='button'
									><Icon name='search'/>Search</Button>
									<CopyModal
										name={name}
										updateInterfaces={() => this.updateInterfaces()}
										servicesBaseUrl={servicesBaseUrl}
									/>
									<DeleteModal
										name={name}
										onClose={() => this.updateInterfaces()}
										servicesBaseUrl={servicesBaseUrl}
									/>
								</Button.Group>
							</Table.Cell>
						</Table.Row>;
					})}
				</Table.Body>
			</Table>
			<NewOrEditModal
				collectionOptions={collectionOptions}
				fields={fields}
				onClose={() => this.updateInterfaces()}
				servicesBaseUrl={servicesBaseUrl}
				stopWordOptions={stopWordOptions}
				thesauriOptions={thesauriOptions}
			/>
		</>;
	} // render
} // class Interfaces
