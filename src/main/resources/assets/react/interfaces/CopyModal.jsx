import {Button, Icon, Input, Message, Modal} from 'semantic-ui-react';


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
