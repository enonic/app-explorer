import getIn from 'get-value';
import {
	Button,
	Form,
	Radio,
	Table
} from 'semantic-ui-react';
import {getEnonicContext} from 'semantic-ui-react-form/Context';
import {Checkbox} from 'semantic-ui-react-form/inputs/Checkbox';
import {List} from 'semantic-ui-react-form/List';

import {Checkmark} from '../components/Checkmark';
import {Span} from '../components/Span';
import {AddOrEditLocalField} from './AddOrEditLocalField';
import {RemoveFieldFromDocumentTypeModal} from './RemoveFieldFromDocumentTypeModal';


//const PATH_FIELDS = 'fields';
const PATH_PROPERTIES = 'properties';


export const FieldsList = ({
	collections,
	globalFields,
	interfaces,
	servicesBaseUrl
}) => {
	const [context/*, dispatch*/] = getEnonicContext();

	const properties = getIn(context.values, 'properties');
	//console.debug('properties', properties);

	const GLOBAL_FIELD_OBJ = {};
	//const GLOBAL_FIELD_OPTIONS = globalFields.map(({
	globalFields.forEach(({
		_id,
		//decideByType,
		enabled,
		fieldType,
		fulltext,
		includeInAllText,
		key,
		max,
		min,
		nGram,
		path
	}) => {
		GLOBAL_FIELD_OBJ[_id] = {
			//decideByType,
			enabled,
			fieldType,
			fulltext,
			includeInAllText,
			key,
			max,
			min,
			nGram,
			path
		};
		/*return {
			key: _id,
			text: key,
			value: _id
		};*/
	});

	const [showGlobalFields, setShowGlobalFields] = React.useState(false);

	return <>
		<Form>
			<Form.Field>
				<Radio
					checked={showGlobalFields}
					label='Show Global Fields'
					onChange={(ignored,{checked}) => {
						setShowGlobalFields(checked);
					}}
					toggle
				/>
			</Form.Field>
		</Form>
		{showGlobalFields || (
			properties && Array.isArray(properties) && properties.length
		) ?	<Table celled compact selectable singleLine striped>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell collapsing>Active</Table.HeaderCell>
						<Table.HeaderCell collapsing>Edit</Table.HeaderCell>
						<Table.HeaderCell>Field</Table.HeaderCell>
						<Table.HeaderCell collapsing>Value type</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Min</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Max</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Indexing</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Include in _allText</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Fulltext</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Ngram</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Path</Table.HeaderCell>
						<Table.HeaderCell collapsing>Delete</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					<List
						path={PATH_PROPERTIES}
						render={(propertiesArray) => {
							return <>{propertiesArray.map(({
								active,
								enabled,
								fulltext,
								includeInAllText,
								max,
								min,
								name,
								nGram,
								path,
								valueType
							}, index) => {
								//console.debug('nGram', nGram);
								const PATH_PROPERTY = `${PATH_PROPERTIES}.${index}`;
								return <Table.Row key={PATH_PROPERTY}>
									<Table.Cell collapsing><Checkbox
										name='active'
										parentPath={PATH_PROPERTY}
										toggle
										value={active}
									/></Table.Cell>
									<Table.Cell collapsing>
										<AddOrEditLocalField
											fulltext={fulltext}
											globalFieldObj={GLOBAL_FIELD_OBJ}
											includeInAllText={includeInAllText}
											max={max}
											min={min}
											name={name}
											nGram={nGram}
											path={path}
											valueType={valueType}
										/>
									</Table.Cell>
									<Table.Cell disabled={!active} style={{
										textDecoration: active ? 'none' : 'line-through'
									}}>{name}</Table.Cell>
									<Table.Cell collapsing>
										{active ? <Span color='grey'>{valueType}</Span>/*<EnonicDropdown
											disabled={!active}
											options={OPTIONS_VALUE_TYPES}
											name='valueType'
											parentPath={PATH_PROPERTY}
											selection
										/>*/ : null}
									</Table.Cell>
									<Table.Cell collapsing textAlign='center'>
										{active ? <Span color='grey'>{min === 0 ? null : min}</Span>/*<Input
											disabled={!active}
											fluid
											name='min'
											parentPath={PATH_PROPERTY}
											type='number'
											value={min}
										/>*/ : null}
									</Table.Cell>
									<Table.Cell collapsing textAlign='center'>
										{active ? <Span color='grey'>{max === 0 ? '∞' : max}</Span>/*<Input
											disabled={!active}
											fluid
											name='max'
											parentPath={PATH_PROPERTY}
											type='number'
											value={max}
										/>*/ : null}
									</Table.Cell>
									<Table.Cell collapsing textAlign='center'>
										{active ? <Checkmark disabled checked={enabled} size='large'/>/*<Checkbox
											name='enabled'
											parentPath={PATH_PROPERTY}
											toggle
										/>*/ : null}
									</Table.Cell>
									<Table.Cell collapsing textAlign='center'>
										{active && enabled ? <Checkmark disabled checked={includeInAllText} size='large'/>/*<Checkbox
											disabled={!active || !enabled}
											name='includeInAllText'
											parentPath={PATH_PROPERTY}
											toggle
										/>*/ : null}
									</Table.Cell>
									<Table.Cell collapsing textAlign='center'>
										{active && enabled ? <Checkmark disabled checked={fulltext} size='large'/>/*<Checkbox
											disabled={!active || !enabled}
											name='fulltext'
											parentPath={PATH_PROPERTY}
											toggle
										/>*/ : null}
									</Table.Cell>
									<Table.Cell collapsing textAlign='center'>
										{active && enabled ? <Checkmark disabled checked={nGram} size='large'/>/*<Checkbox
											disabled={!active || !enabled}
											name='nGram'
											parentPath={PATH_PROPERTY}
											toggle
										/>*/ : null}
									</Table.Cell>
									<Table.Cell collapsing textAlign='center'>
										{active && enabled ? <Checkmark disabled checked={path} size='large'/>/*<Checkbox
											disabled={!active || !enabled}
											name='path'
											parentPath={PATH_PROPERTY}
											toggle
										/>*/ : null}
									</Table.Cell>
									<Table.Cell collapsing>
										<Button.Group>
											<RemoveFieldFromDocumentTypeModal
												collections={collections}
												index={index}
												interfaces={interfaces}
												name={name}
												path={PATH_PROPERTIES}
												servicesBaseUrl={servicesBaseUrl}
											/>
										</Button.Group>
									</Table.Cell>
								</Table.Row>;
							})}
							</>;
						}}
					/>
				</Table.Body>
			</Table> : null}
		<AddOrEditLocalField
			globalFieldObj={GLOBAL_FIELD_OBJ}
		/>
	</>;
};

/*
<List
	path={PATH_FIELDS}
	render={(fieldsArray) => {
		//console.debug(`NewOrEditDocumentType fieldsArray`, fieldsArray);
		return <>
			{(() => {
				const selectedFields = {};
				return fieldsArray.map(({
					active,
					fieldId
				}, index) => {
					if (fieldId) {
						selectedFields[fieldId] = true;
					}
					const fieldObj = fieldId && GLOBAL_FIELD_OBJ[fieldId] || {};
					//console.debug('NewOrEditDocumentType fieldId', fieldId, 'fieldObj', fieldObj);
					const {
						//decideByType,
						enabled,
						fieldType,
						fulltext,
						includeInAllText,
						key,
						max,
						min,
						nGram,
						path
					} =  fieldObj;
					//console.debug('NewOrEditDocumentType active', active, 'key', key);
					const PATH_FIELD = `${PATH_FIELDS}.${index}`;
					return <Table.Row key={index}>
						<Table.Cell collapsing><Checkbox
							name='active'
							parentPath={PATH_FIELD}
							toggle
							value={active}
						/></Table.Cell>
						<Table.Cell collapsing></Table.Cell>
						<Table.Cell disabled={!active} style={{
							textDecoration: active ? 'none' : 'line-through'
						}}><Span color='grey'>{key}</Span></Table.Cell>
						<Table.Cell collapsing><Span color='grey'>{active ? fieldType : null}</Span></Table.Cell>
						<Table.Cell collapsing textAlign='center'>{active ? <Span color='grey'>{min === 0 ? null : min}</Span> : null}</Table.Cell>
						<Table.Cell collapsing textAlign='center'>{active ? <Span color='grey'>{max === 0 ? '∞' : max}</Span> : null}</Table.Cell>
						<Table.Cell collapsing textAlign='center'>{active
							? (enabled === true || enabled === false)
								? <Checkmark disabled checked={enabled} size='large'/>
								: null // enabled === undefined
							: null // !active
						}</Table.Cell>
						<Table.Cell collapsing textAlign='center'>{(active && enabled)
							? (includeInAllText === true || includeInAllText === false)
								? <Checkmark disabled checked={includeInAllText} size='large'/>
								: null // includeInAllText === undefined
							: null // !active
						}</Table.Cell>
						<Table.Cell collapsing textAlign='center'>{(active && enabled)
							? (fulltext === true || fulltext === false)
								? <Checkmark disabled checked={fulltext} size='large'/>
								: null // fulltext === undefined
							: null // !active
						}</Table.Cell>
						<Table.Cell collapsing textAlign='center'>{(active && enabled)
							? (nGram === true || nGram === false)
								? <Checkmark disabled checked={nGram} size='large'/>
								: null // nGram === undefined
							: null // !active
						}</Table.Cell>
						<Table.Cell collapsing textAlign='center'>{(active && enabled)
							? (path === true || path === false)
								? <Checkmark disabled checked={path} size='large'/>
								: null // nGram === undefined
							: null // !active
						}</Table.Cell>
						<Table.Cell collapsing>
							<Button.Group>
								<RemoveFieldFromDocumentTypeModal
									collections={collections}
									index={index}
									interfaces={interfaces}
									name={key}
									path={PATH_FIELDS}
									servicesBaseUrl={servicesBaseUrl}
								/>
							</Button.Group>
						</Table.Cell>
					</Table.Row>;
				}); // map
			})()}
		</>;
	}}
/>
*/
