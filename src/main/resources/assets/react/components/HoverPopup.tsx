import type {PopupContentProps} from 'semantic-ui-react';


import {Button,Popup} from 'semantic-ui-react';


export function HoverPopup ({
	content,
	header,
	icon = 'options',
	open,
	setOpen,
	...rest
}: PopupContentProps & {
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
	return <Popup
		content={content}
		flowing
		header={header}
		hoverable
		inverted
		on='hover'
		onClose={() => {setOpen(false)}}
		onOpen={() => {setOpen(true)}}
		open={open}
		trigger={<Button
			basic={!open}
			circular
			icon={icon}
			size='medium'
		/>}
		{...rest}
	/>;
	// Since ...rest is last, everything can be overridden :)
}
