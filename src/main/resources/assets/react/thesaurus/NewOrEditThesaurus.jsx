import {Button, Form, Header, Icon, Input, Modal} from 'semantic-ui-react';

import {Form as EnonicForm} from '../enonic/Form';
import {Input as EnonicInput} from '../enonic/Input';
import {ResetButton} from '../enonic/ResetButton';
import {SubmitButton} from '../enonic/SubmitButton';


function required(value) {
	return value ? undefined : 'Required!';
}


export function NewOrEditThesaurus(props) {
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
		><Icon color='blue' name='edit'/>Edit thesaurus</Button>
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
