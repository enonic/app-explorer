import {Button, Icon, Input, Message, Modal, Table} from 'semantic-ui-react';


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
				interfaces: data,
				isLoading: false
			}));
	} // updateInterfaces


	componentDidMount() {
		console.debug('Interfaces componentDidMount');
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
			interfaces: {
				hits
			}
		} = this.state;
		//console.debug(hits);

		return <>
			<Table celled collapsing compact selectable singleLine striped>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Name</Table.HeaderCell>
						<Table.HeaderCell>Actions</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{hits.map(({displayName, name}, index) => {
						//console.debug({displayName, name, index});
						return <Table.Row key={index}>
							<Table.Cell collapsing>{displayName}</Table.Cell>
							<Table.Cell collapsing>
								<Button.Group>
									<Button
										as='a'
										compact
										href={`${TOOL_PATH}/interfaces/edit/${name}`}
										size='tiny'
										type='button'
									><Icon color='blue' name='edit'/>Edit</Button>
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
			<Button onClick={() => {
				window.location = `${TOOL_PATH}/interfaces/new`
			}} type='button'><Icon color='green' name='plus'/>New interface</Button>
		</>;
	} // render
} // class Interfaces
