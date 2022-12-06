import type {DropdownItemProps} from 'semantic-ui-react';
import type {InterfaceField} from '/lib/explorer/types/Interface.d';
import type {FieldNameToValueTypes} from '../index.d';
import type {TermQuery} from '../useNewOrEditInterfaceState';


import {VALUE_TYPE_STRING} from '@enonic/js-utils';
import {
	Button,
	Header,
} from 'semantic-ui-react';
import {FieldSelector} from './FieldSelector';
import {Term} from './Term'


export function BoostBuilder({
	fieldNameToValueTypesState,
	fieldOptions,
	fields, setFields,
	isDefaultInterface,
	isLoading,
	termQueries,
	setTermQueries,
}: {
	fieldNameToValueTypesState: FieldNameToValueTypes
	fieldOptions: DropdownItemProps[]
	fields: InterfaceField[]
	isDefaultInterface: boolean
	isLoading: boolean
	setFields: React.Dispatch<React.SetStateAction<InterfaceField[]>>
	setTermQueries: React.Dispatch<React.SetStateAction<TermQuery[]>>
	termQueries: TermQuery[]
}) {
	return <>
		<Header
			as='h3'
			content='Boosting'
			disabled={isLoading || isDefaultInterface}
			dividing
			id='boosting'
			size='medium'
		/>
		{termQueries.length ? null : <Button
			content='Term'
			icon={{
				color: 'green',
				name: 'plus'
			}}
			onClick={()=>{setTermQueries(prev => {
				prev.push({
					// boost: 1,
					// field: '',
					// type: VALUE_TYPE_STRING,
					// value: ''
				});
				return prev;
			})}}
		/>}
		<Button
			content='In'
			icon={{
				color: 'green',
				name: 'plus'
			}}
		/>
		<Button
			content='Like'
			icon={{
				color: 'green',
				name: 'plus'
			}}
		/>
		<Button
			content='Range'
			icon={{
				color: 'green',
				name: 'plus'
			}}
		/>
		<Button
			content='PathMatch'
			icon={{
				color: 'green',
				name: 'plus'
			}}
		/>
		<Button
			content='Exists'
			icon={{
				color: 'green',
				name: 'plus'
			}}
		/>
		<Header
			as='h4'
			content='Fields'
			disabled={isLoading || isDefaultInterface}
			dividing
			id='fields'
			size='small'
		/>
		<FieldSelector
			disabled={isLoading || isDefaultInterface}
			fieldOptions={fieldOptions}
			setFields={setFields}
			value={fields}
		/>
		<Term
			fieldNameToValueTypesState={fieldNameToValueTypesState}
			fieldOptions={fieldOptions}
			isDefaultInterface={isDefaultInterface}
			isLoading={isLoading}
			termQueries={termQueries}
			setTermQueries={setTermQueries}
		/>
	</>;
}
