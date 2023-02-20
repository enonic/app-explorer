import {
	type StrictButtonProps,
	Button,
	Icon,
	Popup,
} from 'semantic-ui-react';


export default function RefreshButton({
	basic, // eslint-disable-line
	children, // eslint-disable-line
	content, // eslint-disable-line
	icon, // eslint-disable-line
	loading,
	...rest
}: StrictButtonProps) {
	return <Popup
		content='Refresh'
		inverted
		trigger={<Button
			basic
			className='translucent'
			icon
			{...rest}
		>
			<Icon
				color='blue'
				loading={loading}
				name='refresh'
			/>
		</Button>}
	/>;
}
