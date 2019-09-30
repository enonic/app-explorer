import {Button, Header, Table} from 'semantic-ui-react';

import {NewOrEditInterfaceModal} from './interfaces/NewOrEditInterfaceModal';
import {CopyModal} from './interfaces/CopyModal';
import {DeleteModal} from './interfaces/DeleteModal';
import {SearchModal} from './interfaces/SearchModal';


export class Interfaces extends React.Component {
	constructor(props) {
		//console.debug('Interfaces constructor');
    	super(props);

    	this.state = {
			interfaceExists: false,
			interfaceTo: '',
      		//interfaces: this.props.interfaces || {},
			interfaces: {
				count: 0,
				hits: [],
				total: 0
			},
			isLoading: false
    	};
  	} // constructor


	updateInterfaces() {
		this.setState({ isLoading: true });
		fetch(`${this.props.servicesBaseUrl}/interfaceList`)
			.then(response => response.json())
			.then(data => this.setState({
				collectionOptions: data.collectionOptions,
				fieldsObj: data.fieldsObj,
				interfaces: data.interfaces,
				isLoading: false
			}));
	} // updateInterfaces


	componentDidMount() {
		//console.debug('Interfaces componentDidMount');
		this.updateInterfaces();
	} // componentDidMount


	render() {
		//console.debug('Interfaces render');
		//console.debug(this.props);
		//console.debug(this.state.interfaces);

		const {servicesBaseUrl} = this.props;

		const {
			collectionOptions,
			fieldsObj,
			interfaces: {
				hits
			},
			stopWordOptions,
			thesauriOptions
		} = this.state;
		//console.debug('fieldsObj', fieldsObj);
		//console.debug(hits);

		return <>
			<Header as='h1' content='Interfaces'/>
			<Table celled collapsing compact selectable singleLine striped>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Name</Table.HeaderCell>
						<Table.HeaderCell>Actions</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{hits.map((initialValues, index) => {
						const {displayName, id, name} = initialValues;
						//console.debug({displayName, name, index});
						return <Table.Row key={index}>
							<Table.Cell collapsing>{displayName}</Table.Cell>
							<Table.Cell collapsing>
								<Button.Group>
									<NewOrEditInterfaceModal
										collectionOptions={collectionOptions}
										displayName={displayName}
										fieldsObj={fieldsObj}
										id={id}
										afterClose={() => this.updateInterfaces()}
										servicesBaseUrl={servicesBaseUrl}
										stopWordOptions={stopWordOptions}
										thesauriOptions={thesauriOptions}
									/>
									<SearchModal
										interfaceName={name}
										servicesBaseUrl={servicesBaseUrl}
									/>
									<CopyModal
										name={name}
										updateInterfaces={() => this.updateInterfaces()}
										servicesBaseUrl={servicesBaseUrl}
									/>
									<DeleteModal
										name={name}
										onClose={() => this.updateInterfaces()}
										servicesBaseUrl={servicesBaseUrl}
									/>
								</Button.Group>
							</Table.Cell>
						</Table.Row>;
					})}
				</Table.Body>
			</Table>
			<NewOrEditInterfaceModal
				collectionOptions={collectionOptions}
				fieldsObj={fieldsObj}
				onClose={() => this.updateInterfaces()}
				servicesBaseUrl={servicesBaseUrl}
				stopWordOptions={stopWordOptions}
				thesauriOptions={thesauriOptions}
			/>
		</>;
	} // render
} // class Interfaces
