import {
	Button, Form, Header, Icon, Input, Modal, Table
} from 'semantic-ui-react';


class NewOrEditModal extends React.Component {
	add = () => this.setState(prevState => {
		prevState.words.push('');
		return prevState;
	})


	close = () => {
		this.setState({ open: false });
		this.props.onClose();
	}


	change = (ignored, {name, value}) => {
		return this.setState({[name]: value});
	}


	changeWord = (index) => {
		return (ignored, {value}) => this.setState(prevState => {
			prevState.words.splice(index, 1, value);
			return prevState;
		});
	}


	insert = (index) => () => this.setState(prevState => {
		prevState.words.splice(index, 0, '');
		return prevState;
	});


	moveDown = (index) => () => {
		this.setState(prevState => {
			if (index >= prevState.words.length - 1) { return prevState; } // lastIndex
			const nextIndex = index + 1;
			const nextItem = prevState.words[nextIndex];
			const currentItem = prevState.words[index];
			prevState.words.splice(index, 2, nextItem, currentItem);
			return prevState;
		});
	}


	moveUp = (index) => () => {
		this.setState(prevState => {
			if (index < 1) { return prevState; }
			const prevIndex = index - 1;
			const prevItem = prevState.words[prevIndex];
			const currentItem = prevState.words[index];
			prevState.words.splice(prevIndex, 2, currentItem, prevItem);
			return prevState;
		});
	}


	open = () => this.setState({ open: true })


	remove = (index) => {
		return () => this.setState(prevState => {
			prevState.words.splice(index, 1);
			return prevState;
		});
	}


	save = () => {
		const {mode, servicesBaseUrl} = this.props;
		const {name, displayName, words} = this.state;
		fetch(`${servicesBaseUrl}/stopWordsCreateOrUpdate?mode=${mode === 'edit' ? 'update' : 'create'}&name=${name}&displayName=${displayName}&${words.map(w => `words=${w}`).join('&')}`, {
			method: 'POST'
		})
			.then(response => {
				if (response.status === 200) {
					this.close();
				}
			})
	}


	sort = () => this.setState(prevState => {
		prevState.words = prevState.words.sort((a, b) => a.localeCompare(b));
		return prevState;
	});


	constructor(props) {
		super(props);
		const {
			displayName,
			name,
			words = ['']
		} = props;
		this.state = {
			displayName,
			name,
			words,
			open: false
		};
	} // constructor


	render () {
		const {
			boolShowNameField = false,
			header,
			mode,
			servicesBaseUrl
		} = this.props;
		const {
			displayName,
			name,
			words
		} = this.state;
		return <Modal
			closeIcon
			onClose={this.close}
			open={this.state.open}
			trigger={mode === 'edit'
				? <Button
					compact
					onClick={this.open}
					size='tiny'><Icon color='blue' name='edit'/>Edit</Button>
				: <Button
					circular
					color='green'
					icon
					onClick={this.open}
					size='massive'
					style={{
						bottom: 13.5,
						position: 'fixed',
						right: 13.5
					}}
				><Icon
						color='white'
						name='plus'
					/></Button>
			}
		>
			<Modal.Header>{header}</Modal.Header>
			<Modal.Content>
				<Form>
					{boolShowNameField ? <Form.Field>
						<Input
							autoComplete='off'
							label='Name'
							name='name'
							onChange={this.change}
							placeholder='Name...'
							value={name}
						/>
					</Form.Field> : null}
					<Form.Field>
						<Input
							autoComplete='off'
							label='Display name'
							name='displayName'
							onChange={this.change}
							placeholder='Display name...'
							value={displayName}
						/>
					</Form.Field>
					<Header as='h2'>Stop words</Header>
					<Table celled compact selectable singleLine striped>
						<Table.Header>
							<Table.Row>
								<Table.HeaderCell>Word</Table.HeaderCell>
								<Table.HeaderCell>Actions</Table.HeaderCell>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{words.map((word, index) => {
								const key = `words[${index}]`;
								return <Table.Row key={key}>
									<Table.Cell>
										<Input
											autoComplete='off'
											fluid
											name={key}
											onChange={this.changeWord(index)}
											placeholder='A stop word...'
											value={word}
										/>
									</Table.Cell>
									<Table.Cell collapsing>
										<Button
											compact
											onClick={this.insert(index)}
											size='tiny'
										><Icon color='green' name='plus'/>Insert</Button>
										<Button
											compact
											disabled={index === 0}
											onClick={this.moveUp(index)}
											size='tiny'
										><Icon color='blue' name='arrow up'/>Move up</Button>
										<Button
											compact
											disabled={index >= words.length - 1}
											onClick={this.moveDown(index)}
											size='tiny'
										><Icon color='blue' name='arrow down'/>Move down</Button>
										<Button
											compact
											onClick={this.remove(index)}
											size='tiny'
										><Icon color='red' name='trash alternate outline'/>Delete</Button>
									</Table.Cell>
								</Table.Row>;
							})}
						</Table.Body>
					</Table>
					<Button
						compact
						onClick={this.add}
						size='tiny'
					><Icon color='green' name='plus'/>Add</Button>
					<Button
						compact
						onClick={this.sort}
						size='tiny'
					><Icon color='blue' name='sort alphabet up'/>Sort</Button>
					<Button
						compact
						onClick={this.save}
						size='tiny'
					><Icon color='blue' name='save'/>Save</Button>
				</Form>
			</Modal.Content>
		</Modal>;
	} // render
} // class NewOrEditModal


class DeleteModal extends React.Component {
	close = () => {
		this.setState({ open: false });
		this.props.onClose();
	}


	open = () => this.setState({ open: true })


	remove = () => {
		const {name, servicesBaseUrl} = this.props;
		fetch(`${servicesBaseUrl}/stopWordsDelete?name=${name}`, {
			method: 'DELETE'
		})
			.then(response => {
				if (response.status === 200) {
					this.close();
				}
			})
	} // remove


	constructor(props) {
		super(props);
		this.state = {
			open: false
		}
	} // constructor


	render() {
		const {name} = this.props;
		return <Modal
			closeIcon
			onClose={this.close}
			open={this.state.open}
			trigger={<Button
				compact
				onClick={this.open}
				size='tiny'
			><Icon color='red' name='trash alternate outline'/>Delete</Button>}
		>
			<Modal.Header>Delete {name}</Modal.Header>
			<Modal.Content>
				<Header as='h2'>Do you really want to delete {name}?</Header>
				<Form>
					<Button
						compact
						onClick={this.remove}
						size='tiny'
					><Icon color='red' name='trash alternate outline'/>Confirm Delete</Button>
				</Form>
			</Modal.Content>
		</Modal>;
	} // render
} // class DeleteModal


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
		const {
			servicesBaseUrl,
			TOOL_PATH
		} = this.props;
		const {stopWordsRes} = this.state;
		return <>
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
									displayName={displayName}
									header={`Edit ${displayName} stopWords`}
									mode='edit'
									name={name}
									onClose={() => this.updateStopwords()}
									servicesBaseUrl={servicesBaseUrl}
									words={words}
								/>
								<DeleteModal
									name={name}
									onClose={() => this.updateStopwords()}
									servicesBaseUrl={servicesBaseUrl}
								/>
							</Table.Cell>
						</Table.Row>;
					})}
				</Table.Body>
			</Table>
			<NewOrEditModal
				boolShowNameField={true}
				displayName=''
				header='New stopWords list'
				mode='new'
				name=''
				onClose={() => this.updateStopwords()}
				servicesBaseUrl={servicesBaseUrl}
				words={['']}
			/>
		</>;
	} // render
} // class StopWords
