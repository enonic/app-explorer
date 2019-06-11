export const Download = () => null;

/*import {
	connect,
	Field,
	FieldArray,
	getIn
} from 'formik';
import generateUuidv4 from 'uuid/v4';

import {InsertButton} from '../../buttons/InsertButton';
import {MoveUpButton} from '../../buttons/MoveUpButton';
import {MoveDownButton} from '../../buttons/MoveDownButton';
import {RemoveButton} from '../../buttons/RemoveButton';
import {SetButton} from '../../buttons/SetButton';

import {Fieldset} from '../../elements/Fieldset';
import {Table} from '../../elements/Table';

import {FieldSelector} from '../../fields/FieldSelector';
import {TagSelector} from '../../fields/TagSelector';

//import {toStr} from '../utils/toStr';


export const Download = connect(({
	formik: {
		values
	},
	fields = [],
	name = 'download',
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	tags = [],
	value = getIn(values, path) || []
}) => {
	//console.log(toStr({parentPath, path/*, tags*, value, values}));
	/*if(!value || !Array.isArray(value)) {
		value = [];
	}*
	if(!value.length) {
		return <SetButton
			className='block'
			field={path}
			value={[{
				expr: '',
				tags: [{
					field: '',
					tags: []
				}]
			}]}
			text="Add download expression(s)"
		/>;
	}

	return <Fieldset legend="Download">
		<Table headers={['Expression', 'Tags', 'Actions']}>
			<FieldArray
				id={path}
				name={path}
			>
				{() => value.map(({
					expr,
					tags: tagsArr = [{
						field: '',
						tags: []
					}],
					uuid4 = generateUuidv4()
				}, downloadIndex) => {
					//console.log(JSON.stringify({expr, selectedTags, downloadIndex}, null, 4));

					const downloadKey = `${path}[${downloadIndex}]`;
					//console.log(JSON.stringify({downloadKey}, null, 4));

					return <tr key={uuid4}>
						<td><Field autoComplete="off" name={`${downloadKey}.expr`} value={expr}/></td>
						<td>{tagsArr && tagsArr.length
							? <Table headers={['Field', 'Tags', 'Actions']}>
								<FieldArray
									name={path}
									id={path}
									render={(arrayHelpers) => tagsArr.map(({
										field = '',
										tags: selectedTags = [],
										tagsUuid4 = generateUuidv4()
									}, tagIndex) => {
										const tagsKey = `${downloadKey}.tags[${tagIndex}]`;
										//console.log(JSON.stringify({tagsKey}, null, 4));
										return <tr key={tagsUuid4}>
											<td>
												<FieldSelector
													name={`${tagsKey}.field`}
													fields={fields}
													value={field}
												/>
											</td>
											<td>
												{field ? <TagSelector
													label=""
													multiple={true}
													path={`${tagsKey}.tags`}
													tags={tags[field]}
													value={selectedTags}
												/> : null}
											</td>
											<td>
												<InsertButton
													index={tagIndex}
													path={`${downloadKey}.tags`}
													value={{field: '', tags: []}}
												/>
												<RemoveButton
													index={tagIndex}
													path={`${downloadKey}.tags`}
												/>
												<MoveDownButton
													disabled={tagIndex === tagsArr.length-1}
													index={tagIndex}
													path={`${downloadKey}.tags`}
													visible={tagsArr.length > 1}
												/>
												<MoveUpButton
													index={tagIndex}
													path={`${downloadKey}.tags`}
													visible={tagsArr.length > 1}
												/>
											</td>
										</tr>;
									})}
								/>
							</Table>
							: <SetButton
								className='block'
								field={`${downloadKey}.tags`}
								value={[{field: '', tags: []}]}
								text="Add tag(s)"
							/>
						}</td>
						<td>
							<InsertButton path={path} index={downloadIndex} value={{expr: '', field: '', tags: []}}/>
							<RemoveButton path={path} index={downloadIndex}/>
							<MoveDownButton path={path} disabled={downloadIndex === value.length-1} index={downloadIndex} visible={value.length > 1}/>
							<MoveUpButton path={path} index={downloadIndex} visible={value.length > 1}/>
						</td>
					</tr>;
				})}
			</FieldArray>
		</Table>
	</Fieldset>;
});
*/
