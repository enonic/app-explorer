import React from 'react';
import {
	Loader,
	Modal,
} from 'semantic-ui-react';


export interface LoadingModalState {
	open: boolean
}

export interface LoadingModalProps {
	state: LoadingModalState
	setState: React.Dispatch<React.SetStateAction<LoadingModalState>>
}


function useLoadingModalState() {
	const [state, setState] = React.useState<LoadingModalState>({
		open: false,
	});
	return {
		state, setState
	};
}

function LoadingModal({
	state,
	setState
}: LoadingModalProps) {
	return <Modal
		basic

		closeOnDimmerClick={false}
		closeOnEscape={false}
		dimmer='blurring'
		onClose={() => {
			setState(prev => {
				const deref = {...prev};
				deref.open = false;
				return deref;
			})
		}}
		open={state.open}
		size='fullscreen'
	>
		<Modal.Content>
			<Loader indeterminate>Initializing...</Loader>
		</Modal.Content>
	</Modal>;
}

LoadingModal.useLoadingModalState = useLoadingModalState;

export default LoadingModal
