import {Button, Icon, Input, Message, Modal} from 'semantic-ui-react';


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
