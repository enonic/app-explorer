import type {SemanticICONS} from 'semantic-ui-react';


import * as React from 'react';


function useBottomOverlayBarState() {
	const [icon, setIcon] = React.useState<SemanticICONS>('circle notched');
	const [iconLoading, setIconLoading] = React.useState(true);
	const [messageHeader, setMessageHeader] = React.useState<string>();
	const [message, setMessage] = React.useState<string>();
	const [visible, setVisible] = React.useState(false);
	return {
		icon, setIcon,
		iconLoading, setIconLoading,
		message, setMessage,
		messageHeader, setMessageHeader,
		visible, setVisible,
	}
}

export default useBottomOverlayBarState;
