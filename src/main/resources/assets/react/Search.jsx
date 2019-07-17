import {Form, Formik, getIn} from 'formik';

import {Dropdown} from 'semantic-ui-react';
/*import {
	Dropdown
} from '@enonic/semantic-ui-react-formik-functional/dist/index.cjs';*/


import {Select} from './elements/Select';

import {Hits} from './search/Hits';

import {Field} from './semantic-ui/Field';
import {Fields} from './semantic-ui/Fields';
import {Header} from './semantic-ui/Header';
import {Label} from './semantic-ui/Label';
import {Labels} from './semantic-ui/Labels';
import {SearchInput} from './semantic-ui/SearchInput';
import {Table} from './semantic-ui/Table';

//import {toStr} from './utils/toStr';

const forceArray = data => Array.isArray(data) ? data : [data];


export class Search extends React.Component {
	constructor(props) {
    	super(props);

		const {interfaceName} = props;
		//console.debug(interfaceName);

    	this.state = {
      		cache: {},
			searchString: '',
			interfaceName/*,
			interfaceOptions: []*/
    	};
		//console.debug(this.state);

		this.handleChange = this.handleChange.bind(this);
  	} // constructor


	/*updateInterfaces() {
		this.setState({ isLoading: true });
		fetch(`${this.props.servicesBaseUrl}/interfaceList`)
			.then(response => response.json())
			.then(data => this.setState(prevState => {
				prevState.interfaceOptions = data.hits.map(({displayName: text, name: key}) => ({
					key,
					text,
					value: key
				}));
				if (prevState.interfaceName && !prevState.interfaceOptions.map(({key}) => key).includes(prevState.interfaceName)) {
					prevState.interfaceName = '';
				}
				if (!prevState.interfaceName && prevState.interfaceOptions.length) {
					prevState.interfaceName = prevState.interfaceOptions[0].key;
				}
				prevState.isLoading = false;
				return prevState;
			}));
	} // updateInterfaces*/


	/*componentDidMount() {
		console.debug('Search componentDidMount');
		this.updateInterfaces();
	} // componentDidMount*/


	search({
		searchString
	} = {}) {
		const {servicesBaseUrl} = this.props;
		const {interfaceName} = this.state;
		if(!interfaceName || !searchString) {return;}
		const uri = `${servicesBaseUrl}/search?interface=${interfaceName}&name=searchString&searchString=${searchString}`;
		console.debug(uri);
		fetch(uri)
			.then(response => response.json())
			.then(data => this.setState(prevState => {
				if (!prevState.cache[interfaceName]) {
					prevState.cache[interfaceName] = {};
				}
				prevState.cache[interfaceName][searchString] = data;
				return prevState;
			}));
	}


	/* componentDidMount is invoked immediately after a component is mounted
	(inserted into the tree). Initialization that requires DOM nodes should go
	here. If you need to load data from a remote endpoint, this is a good place
	to instantiate the network request.*/
	//componentDidMount() {
	//} // componentDidMount


	handleChange(syntheticEvent) {
		//console.debug(syntheticEvent);
		const {
			target: {
				name,
				value: searchString
			}
		} = syntheticEvent;
		//console.debug(name, searchString);
		const {interfaceName} = this.state;
		if (name === 'search') {
			this.setState({searchString}); // Async!
			if (!this.state.cache[interfaceName] || !this.state.cache[interfaceName][searchString]) {
				this.search({searchString});
			}
		}
	} // handleChange


	render() {
		const {
			collectionOptions = [],
			thesaurusOptions = [],
			initialValues = {}
		} = this.props;
		const {
			cache,
			interfaceName,
			//interfaceOptions,
			searchString
		} = this.state;
		const data = searchString && cache[interfaceName] && cache[interfaceName][searchString];
		const hits = data ? data.hits : [];
		const synonyms = data && data.synonymsObj;
		const loading = searchString && !data;
		/*console.debug(toStr({
			component: 'Search',
			//collections,
			//thesauri,
			//initialValues,
			searchString,
			loading
		}));*/
		return <Formik
			initialValues={initialValues}
			render={formik => {
				const {
					handleChange,
					values: {
						//collections = [],
						//thesauri = []
					}
				} = formik;
				/*console.debug(toStr({
					component: 'Search Formik',
					collections,
					thesauri
				}));*/
				return <>
					<Form
						style={{
							width: '100%'
						}}
					>
						<Fields>
							{/*<Field>
								<Dropdown
									fluid
									onChange={(ignored,{value}) => {
										//console.debug(value);
										this.setState({interfaceName: value});
									}}
									options={interfaceOptions}
									placeholder={interfaceOptions.length ? 'Please select an interface' : 'You must first configure an interface!'}
									search
									selection
									value={interfaceName}
								/>
							</Field>
							*/}
							{/*<Field>
								<Select
									label="Collections"
									multiple={true}
									name="collections"
									options={collectionOptions}
									value={collections}
								/>
							</Field>
							<Field>
								<Select
									label="Thesauri"
									multiple={true}
									name="thesauri"
									options={thesaurusOptions}
									value={thesauri}
								/>
							</Field>*/}
							<Field>
								<SearchInput
									fluid
									loading={loading}
									onChange={syntheticEvent => {
										handleChange(syntheticEvent);
										this.handleChange(syntheticEvent);
									}}
								/>
							</Field>
						</Fields>
					</Form>
					{/*synonyms ? <>
						<Header dividing text='Synonyms'/>
						<Table basic collapsing compact small very>
							<thead>
								<tr>
									<th>Thesaurus</th>
									<th>Score</th>
									<th>From</th>
									<th>To</th>
								</tr>
							</thead>
							<tbody>
								{Object.keys(synonyms).map((thesaurus, i) => Object.keys(synonyms[thesaurus]).map((from, j) => <tr className="middle aligned" key={`${i}.${j}`}>
									{j === 0 ? <td rowSpan={Object.keys(synonyms[thesaurus]).length}>{thesaurus}</td> : null}
									<td>{synonyms[thesaurus][from].score}</td>
									<td>{data.expand ? <Label basic mini text={from}/> : from}</td>
									<td><Labels mini>{forceArray(synonyms[thesaurus][from].to).map((t, k) => <Label basic key={k} text={t}/>)}</Labels></td>
								</tr>))}
							</tbody>
						</Table>
					</> : null*/}
					<Hits
						hits={hits}
						loading={loading}
					/>
				</>;
			}}
		/>;
	} // render
} // Search Component
