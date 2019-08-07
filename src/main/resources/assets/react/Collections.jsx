import {
	Button, Icon, Modal
} from 'semantic-ui-react';


function NewOrEditModal() {
	const [state, setState] = React.useState({
		open: false
	});

	return <Modal
		closeIcon
		onClose={() => setState({open: false})}
		open={state.open}
		trigger={<Button
			circular
			color='green'
			icon
			onClick={() => setState({open: true})}
			size='massive'
			style={{
				bottom: 13.5,
				position: 'fixed',
				right: 13.5
			}}
		><Icon
				color='white'
				name='plus'
			/></Button>}
	/>;
} // NewOrEditModal


export function Collections(props) {
	const {
		servicesBaseUrl,
		TOOL_PATH
	} = props;

	const [state, setState] = React.useState({});
	console.debug('Collections', {props, state});

	function fetchCollections() {
		fetch(`${servicesBaseUrl}/collectionList`)
			.then(response => response.json())
			.then(data => setState(prev => ({
				...prev,
				...data
			})));
	} // fetchCollections
	//fetchCollections();

	return <NewOrEditModal/>;
} // Collections
