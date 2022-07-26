//import * as gql from 'gql-query-builder';
import * as React from 'react';


export function useNewOrEditSynonymState({
	afterClose = () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
	beforeOpen = () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
} :{
	afterClose ?:() => void
	beforeOpen ?:() => void
}) {
	const [open, setOpen] = React.useState(false);

	function doClose() {
		setOpen(false); // This needs to be before unmount.
		afterClose(); // This could trigger render in parent, and unmount this Component.
	}

	// Made doOpen since onOpen doesn't get called consistently.
	const doOpen = () => {
		beforeOpen();
		setOpen(true);
	};

	return {
		doClose,
		doOpen,
		open
	};
} // function useNewOrEditSynonymState
