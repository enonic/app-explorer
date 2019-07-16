import {createRef} from 'react'
import {
	Button, Form, Header, Icon, Input, Modal, Ref, Sticky, Table
} from 'semantic-ui-react';


export class NewOrEditModal extends React.Component {
	add = () => this.setState(prevState => {
		prevState.words.push('');
		return prevState;
	})


	change = (ignored, {name, value}) => {
		console.debug({name, value});
		return this.setState({[name]: value});
	}


	changeWord = (index) => {
		//console.debug(`index:${index} at define function time`);
		return (ignored, {value}) => this.setState(prevState => {
			//console.debug(`index:${index} at run function time`, value);
			//console.debug(prevState.words);
			prevState.words.splice(index, 1, value);
			//console.debug(prevState.words);
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
			/*console.debug({
				index,
				nextIndex,
				currentItem,
				nextItem,
				words: prevState.words
			});*/
			prevState.words.splice(index, 2, nextItem, currentItem);
			//console.debug(prevState.words);
			return prevState;
		});
	}


	moveUp = (index) => () => {
		this.setState(prevState => {
			if (index < 1) { return prevState; }
			const prevIndex = index - 1;
			const prevItem = prevState.words[prevIndex];
			const currentItem = prevState.words[index];
			/*console.debug({
				prevIndex,
				index,
				currentItem,
				prevItem,
				words: prevState.words
			});*/
			prevState.words.splice(prevIndex, 2, currentItem, prevItem);
			//console.debug(prevState.words);
			return prevState;
		});
	}


	remove = (index) => {
		//console.debug(`index:${index} at define function time`);
		return () => this.setState(prevState => {
			//console.debug(`index:${index} at run function time`);
			//console.debug(prevState.words);
			prevState.words.splice(index, 1);
			//console.debug(prevState.words);
			return prevState;
		});
	}


	sort = () => this.setState(prevState => {
		prevState.words = prevState.words.sort((a, b) => a.localeCompare(b));
		return prevState;
	});


	constructor(props) {
		//console.debug('NewOrEditModal constructor', props);
		super(props);
		const {
			displayName,
			name,
			words = ['']
		} = props;
		this.state = {
			displayName,
			name,
			words
		};
	} // constructor


	/*componentDidMount() {
		console.debug('NewOrEditModal componentDidMount', this.props, this.state);
	} // componentDidMount


	componentDidUpdate(prevProps) {
		console.debug('NewOrEditModal componentDidUpdate', prevProps, this.props, this.state);
	} // componentDidUpdate*/


	render () {
		const {
			boolShowNameField = false,
			header,
			trigger
		} = this.props;
		const {
			displayName,
			name,
			words
		} = this.state;
		return <Modal
			closeIcon
			trigger={trigger}
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
				</Form>
			</Modal.Content>
		</Modal>;
	} // render
} // class NewOrEditModal


export class StopWords extends React.Component {
	constructor(props) {
		//console.debug('StopWords constructor', props);
		super(props);

		const {
			stopWordsRes = {
				count: 0,
				hits: [],
				total: 0
			},
			TOOL_PATH
		} = props;

		this.state = {
			stopWordsRes,
			TOOL_PATH
		};
		//console.debug(this.state);
	} // constructor


	/*componentDidMount() {
		console.debug('StopWords componentDidMount', this.props, this.state);
	} // componentDidMount


	componentDidUpdate(prevProps) {
		console.debug('StopWords componentDidUpdate', prevProps, this.props, this.state);
	} // componentDidUpdate*/


	render() {
		const {
			stopWordsRes,
			TOOL_PATH
		} = this.state;
		//console.debug(this.state);
		const innerRef = createRef();
		return <Ref innerRef={innerRef}>
			<>
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
							return <Table.Row key={index}>
								<Table.Cell collapsing>{displayName}</Table.Cell>
								<Table.Cell collapsing>{words.length}</Table.Cell>
								<Table.Cell collapsing>{words.join(', ')}</Table.Cell>
								<Table.Cell collapsing>
									<NewOrEditModal
										displayName={displayName}
										header={`Edit ${displayName} stopWords`}
										name={name}
										trigger={<Button compact size='tiny'><Icon color='blue' name='edit'/>Edit</Button>}
										words={words}
									/>
									<Button compact size='tiny'><Icon color='red' name='trash alternate outline'/>Delete</Button>
								</Table.Cell>
							</Table.Row>;
						})}
					</Table.Body>
				</Table>
				<Sticky context={innerRef}>
					<NewOrEditModal
						boolShowNameField={true}
						displayName=''
						header='New stopWords list'
						name=''
						trigger={<Button
							circular
							color='green'
							floated='right'
							icon
							size='massive'><Icon name='plus'/></Button>}
						words={['']}
					/>
				</Sticky>
			</>
		</Ref>;
	} // render
} // class StopWords
