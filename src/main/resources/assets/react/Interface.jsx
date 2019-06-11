import {Form, Formik} from 'formik';
import {Menu, Rail, Ref, Segment, Sticky} from 'semantic-ui-react'
import {createRef} from 'react'
import Scrollspy from 'react-scrollspy'
import generateUuidv4 from 'uuid/v4';

import {SubmitButton} from './semantic-ui/SubmitButton';

import {Select} from './elements/Select';
import {TextInput} from './elements/TextInput';

import {Header} from './semantic-ui/Header';

import {ExpressionSelector} from './query/ExpressionSelector';
import {StopWordsSelector} from './query/StopWordsSelector';
import {Pagination} from './query/Pagination'
import {QueryFiltersBuilder} from './query/filter/QueryFiltersBuilder';
import {Facets} from './query/Facets';
import {ResultMappings} from './query/ResultMappings';

//import {toStr} from './utils/toStr';


export const Interface = ({
	action,
	collections,
	fields,
	initialValues = {
		name: '',
		collections: [],
		query: {},
		resultMappings: [{
			field: '',
			highlight: false,
			join: true,
			lengthLimit: '',
			separator: ' ',
			to: '',
			uuid4: generateUuidv4()
		}],
		facets: [],
		pagination: {
			pagesToShow: 10,
			first: true,
			prev: true,
			next: true,
			last: true
		}
	},
	stopWordOptions,
	thesauriOptions
} = {}) => {
	const contextRef = createRef();
	return <Ref innerRef={contextRef}>
		<Segment basic>
			<Formik
				initialValues={initialValues}
				render={({
					handleSubmit,
					values
				}) => {
					/*console.debug(toStr({
						component: 'Interface',
						//collections,
						//fields,
						//thesauriOptions,
						values
					}));*/
					return <Form
						action={action}
						autoComplete="off"
						className='ui form'
						method="POST"
						onSubmit={() => {
							document.getElementById('json').setAttribute('value', JSON.stringify(values))
						}}
						style={{
							width: '100%'
						}}
					>
						<TextInput
							label="Name"
							id='name'
							name="name"
						/>
						<Header dividing text='Collection(s)' id='collections'/>
						<Select
							multiple={true}
							name="collections"
							options={collections}
							values={values}
						/>
						<QueryFiltersBuilder
							fields={fields}
						/>
						<ExpressionSelector
							fields={fields}
							id='query'
							legend='Query'
							name='query'
							thesauriOptions={thesauriOptions}
						/>
						<StopWordsSelector
							options={stopWordOptions}
						/>
						<ResultMappings
							fields={fields}
							id='resultmappings'
							legend='Result mapping(s)'
						/>
						<Facets
							fields={fields}
							id='facets'
							legend='Facet(s)'
						/>
						<Pagination
							id='pagination'
							legend='Pagination'
						/>
						<SubmitButton className='primary' text="Save interface" id='save'/>
						<input id="json" name="json" type="hidden"/>
					</Form>;
				}}
			/>
			<Rail position='right'>
				<Sticky context={contextRef} offset={14}>
					<Scrollspy
						items={[
							'top',
							'name',
							'collections',
							'must',
							'mustnot',
							'query',
							'resultmappings',
							'facets',
							'pagination',
							'save',
						]}
						currentClassName='active'
						componentTag={({children}) => <Menu vertical>{children}</Menu>}
					>
						<Menu.Item href='#top'>Menu</Menu.Item>
						<Menu.Item href='#name'>Name</Menu.Item>
						<Menu.Item href='#collections'>Collections</Menu.Item>
						<Menu.Item href='#must'>Must</Menu.Item>
						<Menu.Item href='#mustnot'>MustNot</Menu.Item>
						<Menu.Item href='#query'>Query</Menu.Item>
						<Menu.Item href='#stopwords'>Stop words</Menu.Item>
						<Menu.Item href='#resultmappings'>Result mappings</Menu.Item>
						<Menu.Item href='#facets'>Facets</Menu.Item>
						<Menu.Item href='#pagination'>Pagination</Menu.Item>
						<Menu.Item href='#save'>Save</Menu.Item>
					</Scrollspy>
				</Sticky>
			</Rail>
		</Segment>
	</Ref>;
} // Interface
