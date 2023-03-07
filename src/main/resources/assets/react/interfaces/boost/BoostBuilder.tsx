import type {
	DropdownItemProps,
	TRANSITION_STATUSES as TransitionStatuses,
} from 'semantic-ui-react';
import type {
	InterfaceField,
	TermQuery,
} from '/lib/explorer/types/Interface.d';
import type {
	GetFieldValuesParams,
	FieldNameToValueTypes,
	FieldPathToValueOptions,
} from '../index.d';


// import {VALUE_TYPE_STRING} from '@enonic/js-utils';
import {
	Button,
	Header,
	Segment,
	Transition,
} from 'semantic-ui-react';
import {Fields} from './Fields';
import {Term} from './Term';


const DURATION_BUTTON_HIDE = 250;
const DURATION_BUTTON_SHOW = 500;


export function BoostBuilder({
	collectionIdsFromStorage,
	fieldButtonVisible,
	fieldNameToValueTypesState,
	fieldOptions,
	fields, setFields,
	fieldValueOptions,
	getFieldValues,
	isDefaultInterface,
	isLoading,
	servicesBaseUrl,
	setFieldButtonVisible,
	setFieldValueOptions,
	setTermButtonVisible,
	setTermQueries,
	termButtonVisible,
	termQueries,
}: {
	collectionIdsFromStorage: string[]
	fieldButtonVisible: boolean
	fieldNameToValueTypesState: FieldNameToValueTypes
	fieldOptions: DropdownItemProps[]
	fields: InterfaceField[]
	fieldValueOptions: FieldPathToValueOptions
	getFieldValues: (params: GetFieldValuesParams) => void
	isDefaultInterface: boolean
	isLoading: boolean
	servicesBaseUrl: string
	setFieldButtonVisible: React.Dispatch<React.SetStateAction<boolean>>
	setFields: React.Dispatch<React.SetStateAction<InterfaceField[]>>
	setFieldValueOptions: React.Dispatch<React.SetStateAction<FieldPathToValueOptions>>
	setTermButtonVisible: React.Dispatch<React.SetStateAction<boolean>>
	setTermQueries: React.Dispatch<React.SetStateAction<TermQuery[]>>
	termButtonVisible: boolean
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
		<Segment basic style={{padding: '0 0 0 14'}}>
			<Transition
				animation='fade down'
				duration={{
					hide: DURATION_BUTTON_HIDE,
					show: DURATION_BUTTON_SHOW
				}}
				onStart={(_null,{status} :{status: TransitionStatuses}) => {
					// console.debug('button onStart', status);
					if (status === 'EXITING') {
						// setTimeout(() => {
						// 	setSegmentVisible(true);
						// }, DELAY_SEGMENT_SHOW)
					}
				}}
				visible={fieldButtonVisible}
			>
				<Button
					content='Field'
					icon={{
						color: 'green',
						name: 'plus'
					}}
					onClick={() => {
						setFieldButtonVisible(false);
						setTimeout(() => {
							setFields([{
								boost: 1,
								name: ''
							}]);
						}, DURATION_BUTTON_HIDE);
					}}
				/>
			</Transition>
			<Transition
				animation='fade down'
				duration={{
					hide: DURATION_BUTTON_HIDE,
					show: DURATION_BUTTON_SHOW
				}}
				visible={termButtonVisible}
			>
				<Button
					content='Term'
					icon={{
						color: 'green',
						name: 'plus'
					}}
					onClick={()=>{
						setTermButtonVisible(false);
						setTermQueries(prev => {
							prev.push({
								// boost: 1,
								// field: '',
								// type: VALUE_TYPE_STRING,
								// value: ''
							});
							return prev;
						})
					}}
				/>
			</Transition>
			{/*
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
			*/}
			<Fields
				fields={fields}
				fieldOptions={fieldOptions}
				isDefaultInterface={isDefaultInterface}
				isLoading={isLoading}
				setFields={setFields}
				setFieldButtonVisible={setFieldButtonVisible}
			/>
			<Term
				collectionIdsFromStorage={collectionIdsFromStorage}
				fieldNameToValueTypesState={fieldNameToValueTypesState}
				fieldOptions={fieldOptions}
				fieldValueOptions={fieldValueOptions}
				getFieldValues={getFieldValues}
				isDefaultInterface={isDefaultInterface}
				isLoading={isLoading}
				termQueries={termQueries}
				servicesBaseUrl={servicesBaseUrl}
				setTermQueries={setTermQueries}
				setFieldValueOptions={setFieldValueOptions}
				setTermButtonVisible={setTermButtonVisible}
			/>
		</Segment>
	</>;
}
