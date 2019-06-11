import {connect, FieldArray, getIn} from 'formik';
import generateUuidv4 from 'uuid/v4';


import {InsertButton} from '../buttons/InsertButton';
import {MoveUpButton} from '../buttons/MoveUpButton';
import {MoveDownButton} from '../buttons/MoveDownButton';
import {RemoveButton} from '../buttons/RemoveButton';
import {SetButton} from '../buttons/SetButton';

import {FieldSelector} from '../fields/FieldSelector';
import {TagSelector} from '../fields/TagSelector';

import {Buttons} from '../semantic-ui/Buttons';
import {Field} from '../semantic-ui/Field';
import {Header} from '../semantic-ui/Header';
import {Icon} from '../semantic-ui/Icon';

import {isSet} from '../utils/isSet';
//mport {toStr} from '../utils/toStr';


export const Facets = connect(({
	formik: {
		values
	},
	field,
	fields,
	id,
	legend = null,
	level = 0,
	levels = 2,
	name = 'facets',
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	value = values && getIn(values, path) || []
}) => {
	//console.debug(toStr({component: 'Facets', path, field, value}));
	if (!(Array.isArray(value) && value.length)) {
		return <Field id={id}>
			<SetButton
				field={path}
				value={[{
					tag: '',
					uuid4: generateUuidv4()
				}]}
			><Icon className='green plus'/> Add facet(s)</SetButton>
		</Field>;
	}
	level += 1;
	const allowChildren = level !== levels;
	/*console.debug(toStr({level, levels, allowChildren, path, field, value}));
	if (field && tags) {
		console.debug(toStr({
			tags,
			[`tag[${field}]`]: tags[field]
		}));
	}*/
	return <>
		<Header dividing id={id}>{legend}</Header>
		<FieldArray
			name={path}
			render={() => value
				.map(({
					facets,
					tag = '',
					uuid4
				}, index) => {
					//console.debug(toStr({facets, tag, uuid4}));
					const pathWithIndex = `${path}[${index}]`;
					return <div key={uuid4}>
						{level === 1 ? <FieldSelector
							fields={fields}
							name='tag'
							parentPath={pathWithIndex}
							placeholder='Please select a field'
						/> : (field ? <TagSelector
							parentPath={pathWithIndex}
							placeholder='Please select a tag'
							tags={fields[field].values}
						/> : null)}
						{allowChildren ? <Facets
							field={tag}
							fields={fields}
							legend=''
							level={level}
							levels={levels}
							parentPath={pathWithIndex}
						/> : null}
						<Buttons icon>
							<InsertButton
								index={index}
								path={path}
								value={{
									tag: '',
									//facets: [],
									uuid4: generateUuidv4() // Might not be needed
								}}
							/>
							<RemoveButton
								index={index}
								path={path}
							/>
							<MoveDownButton
								disabled={index === value.length-1}
								index={index}
								path={path}
								visible={value.length > 1}
							/>
							<MoveUpButton
								index={index}
								path={path}
								visible={value.length > 1}
							/>
						</Buttons>
					</div>
				})}
		/>
	</>;
}); // Facets
