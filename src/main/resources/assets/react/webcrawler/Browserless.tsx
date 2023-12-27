import {
	Button,
	Form,
	Header,
	Icon,
} from 'semantic-ui-react';
import HoverButton from '../components/buttons/HoverButton';


export function Browserless({
	browserlessUrl,
	setBrowserlessUrl
}: {
	browserlessUrl: string
	setBrowserlessUrl: (browserlessUrl: string) => void
}) {
	if (typeof browserlessUrl !== 'string') {
		return <Form.Field>
			<Button
				onClick={() => {
					setBrowserlessUrl('');
				}}
			>
				<Icon color='green' name='plus'/>Add Browserless URL
			</Button>
		</Form.Field>;
	}
	return <>
		<Header as='h4' content='Browserless URL' dividing/>
		<Form.Group>
			<Form.Input
				fluid
				onChange={(_event,{value}) => {
					setBrowserlessUrl(value);
				}}
				placeholder='http://localhost:3000/content'
				value={browserlessUrl}
				width={15}
			/>
			<Form.Field width={1}>
				<HoverButton
					color='red'
					icon='trash alternate outline'
					onClick={() => setBrowserlessUrl(undefined)}
				/>
			</Form.Field>
		</Form.Group>
	</>;
}
