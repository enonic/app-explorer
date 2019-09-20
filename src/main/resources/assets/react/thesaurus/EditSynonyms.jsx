import Uri from 'jsuri';
import {
	Button, Dropdown, Form, Header, Icon, Loader, Pagination, Table
} from 'semantic-ui-react';

import {NewOrEditSynonym} from './NewOrEditSynonym';
import {DeleteSynonym} from './DeleteSynonym';


export function EditSynonyms(props) {
	//console.debug('EditSynonyms props', props);
	const {
		servicesBaseUrl,
		thesaurusId,
		thesaurusName
	} = props;

	const [state, setState] = React.useState({
		column: 'from',
		direction: 'ascending',
		isLoading: true,
		params: {
			from: '',
			perPage: 10,
			page: 1,
			query: '',
			sort: 'from ASC',
			thesauri: thesaurusName ? [thesaurusName] : [],
			to: ''
		},
		result: {
			aggregations: {
				thesaurus: {
					buckets: []
				}
			}
		}
	});

	function querySynonyms(params = state.params) {
		//console.debug('querySynonyms params', params, 'state', state);

		// Get fallback params from prev state
		Object.entries(state.params).forEach(([k, v]) => {
			//console.debug('querySynonyms k', k, 'v', v, `params[${k}]`, params[k], `typeof params[${k}]`, typeof params[k]);
			if (typeof params[k] === 'undefined') {
				params[k] = v;
			}
		});
		//console.debug('querySynonyms params', params, 'state', state);

		// Dispatch isLoading and all params to state
		setState(prev => {
			const deref = JSON.parse(JSON.stringify(prev));
			deref.isLoading = true;
			Object.entries(params).forEach(([k, v]) => {
				deref.params[k] = v;
			});
			const [column, direction] = params.sort.split(' '); // 'from ASC'
			deref.column = column;
			deref.direction = direction === 'DESC' ? 'descending' : 'ascending';
			//console.debug('querySynonyms deref', deref);
			return deref;
		});

		const uri = new Uri(`${servicesBaseUrl}/thesauri`);
		Object.entries(params).forEach(([k, v]) => {
			//console.debug({k, v});
			uri.replaceQueryParam(k, v);
		});
		const uriStr = uri.toString();
		//console.debug('uriStr', uriStr);
		fetch(uriStr)
			.then(response => response.json())
			.then(data => {
				//console.debug('data', data);
				setState(prev => {
					const deref = JSON.parse(JSON.stringify(prev));
					deref.isLoading = false;
					deref.result = data.queryResult;
					return deref;
				});
			})
	} // querySynonyms

	React.useEffect(() => querySynonyms(), []);

	function setSort({column, direction}) {
		//console.debug('setSort column', column, 'direction', direction);
		querySynonyms({sort: `${column} ${direction === 'ascending' ? 'ASC' : 'DESC'}`});
	} // changeSort

	const handleSortGenerator = (clickedColumn) => () => {
		const {
			column,
			direction
		} = state;
		//console.debug('handleSortGenerator clickedColumn', clickedColumn, 'column', column, 'direction', direction);

		setSort({
			column: clickedColumn,
			direction: clickedColumn === column
				? (direction === 'ascending'
					? 'descending'
					: 'ascending'
				) : 'ascending'
		});
	} // handleSortGenerator
	//console.debug('state', state);

	const {
		column,
		direction,
		isLoading,
		params: {
			from,
			perPage,
			sort,
			thesauri,
			to
		},
		result
	} = state;
	//console.debug('column', column, 'direction', direction, 'sort', sort);

	const {
		aggregations,
		end,
		page,
		start,
		total,
		totalPages
	} = result;

	return <>
		<Form>
			<Header as='h4'><Icon name='filter'/> Filter</Header>
			<Form.Field>
				<input
					fluid='true'
					label='From'
					onChange={({target:{value}}) => querySynonyms({from: value})}
					placeholder='From'
					value={from}
				/>
			</Form.Field>
			<Form.Field>
				<input
					fluid='true'
					label='To'
					onChange={({target:{value}}) => querySynonyms({to: value})}
					placeholder='To'
					value={to}
				/>
			</Form.Field>

			{thesaurusId ? null : <>
				<Header as='h4'><Icon name='font'/> Thesauri</Header>
				<Dropdown
					defaultValue={thesauri}
					fluid
					multiple={true}
					name='thesauri'
					onChange={(e, {value}) => querySynonyms({thesauri: value})}
					options={aggregations.thesaurus.buckets.map(({key, docCount}) => {
						const tName = key.replace('/thesauri/', '');
						return {
							key: tName,
							text: `${tName} (${docCount})`,
							value: tName
						};
					})}
					search
					selection
				/>
			</>}

			<Header as='h4'><Icon name='resize vertical'/> Per page</Header>
			<Form.Field>
				<Dropdown
					defaultValue={perPage}
					fluid
					onChange={(e,{value}) => querySynonyms({perPage: value})}
					options={[5,10,25,50,100].map(key => ({key, text: `${key}`, value: key}))}
					selection
				/>
			</Form.Field>

			{/*<Header as='h4'><Icon name='sort'/> Sort</Header>
			<Form.Field>
				<Dropdown
					defaultValue={sort}
					fluid
					onChange={(e,{value}) => querySynonyms({sort: value})}
					options={[{
						key: '_score DESC',
						text: 'Score descending',
						value: '_score DESC'
					}, {
						key: 'from ASC',
						text: 'From ascending',
						value: 'from ASC'
					}]}
					selection
				/>
			</Form.Field>*/}
		</Form>
		{isLoading
			? <Loader active inverted>Loading</Loader>
			: <>
				<Table celled compact selectable sortable striped attached='top'>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell
								onClick={handleSortGenerator('from')}
								sorted={column === 'from' ? direction : null}
							>From</Table.HeaderCell>
							<Table.HeaderCell
								onClick={handleSortGenerator('to')}
								sorted={column === 'to' ? direction : null}
							>To</Table.HeaderCell>
							{thesaurusId ? null : <Table.HeaderCell
								onClick={handleSortGenerator('_parentPath')}
								sorted={column === '_parentPath' ? direction : null}
							>Thesaurus</Table.HeaderCell>}
							<Table.HeaderCell
								onClick={handleSortGenerator('_score')}
								sorted={column === '_score' ? direction : null}
							>Score</Table.HeaderCell>
							<Table.HeaderCell>Actions</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{result.hits.map(({
							from = [''],
							id,
							name,
							score,
							thesaurus,
							thesaurusReference,
							to = ['']
						}, i) => <Table.Row key={i}>
							<Table.Cell>{(Array.isArray(from) ? from : [from]).join(', ')}</Table.Cell>
							<Table.Cell>{(Array.isArray(to) ? to : [to]).join(', ')}</Table.Cell>
							{thesaurusId ? null : <Table.Cell>{thesaurus}</Table.Cell>}
							<Table.Cell>{score}</Table.Cell>
							<Table.Cell>
								<Button.Group>
									<NewOrEditSynonym
										onClose={querySynonyms}
										servicesBaseUrl={servicesBaseUrl}
										thesaurusId={thesaurusReference}
									/>
									<NewOrEditSynonym
										id={id}
										from={from}
										onClose={querySynonyms}
										servicesBaseUrl={servicesBaseUrl}
										to={to}
										thesaurusId={thesaurusReference}
									/>
									<DeleteSynonym
										id={id}
										from={from}
										onClose={querySynonyms}
										servicesBaseUrl={servicesBaseUrl}
										thesaurusId={thesaurusReference}
										to={to}
									/>
								</Button.Group>
							</Table.Cell>
						</Table.Row>)}
					</Table.Body>
				</Table>
				<Pagination
					attached='bottom'
					fluid
					size='mini'

					activePage={page}
					boundaryRange={1}
					siblingRange={1}
					totalPages={totalPages}

					ellipsisItem={{content: <Icon name='ellipsis horizontal' />, icon: true}}
					firstItem={{content: <Icon name='angle double left' />, icon: true}}
					prevItem={{content: <Icon name='angle left' />, icon: true}}
					nextItem={{content: <Icon name='angle right' />, icon: true}}
					lastItem={{content: <Icon name='angle double right' />, icon: true}}

					onPageChange={(e,{activePage}) => querySynonyms({page: activePage})}
				/>
				<p>Displaying {start}-{end} of {total}</p>
				{thesaurusId && <NewOrEditSynonym
					onClose={querySynonyms}
					servicesBaseUrl={servicesBaseUrl}
					thesaurusId={thesaurusId}
				/>}
			</>
		}
	</>;
} // EditSynonyms
