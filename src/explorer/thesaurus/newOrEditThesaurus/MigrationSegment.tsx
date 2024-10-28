import type {Task} from '@enonic-types/lib-explorer'
import type {JSONResponse}  from '../../fetchers/index.d';
import type {Locales} from '../../index.d';


import {
	TASK_STATE_FAILED,
	TASK_STATE_FINISHED,
	TASK_STATE_RUNNING,
	TASK_STATE_WAITING
} from '@enonic/js-utils';
import * as gql from 'gql-query-builder-ts';
import * as React from 'react';
import {Button, Form, Header, Progress, Segment} from 'semantic-ui-react';
import {GQL_QUERY_SYNONYMS_NAME} from '../../../main/resources/services/graphQL/constants';
import {LanguageDropdown} from '../../collection/LanguageDropdown';
//import {useUpdateEffect} from '../../utils/useUpdateEffect';
import {useInterval} from '../../utils/useInterval';


export function MigrationSegment({
	languages,
	loading,
	locales,
	servicesBaseUrl,
	setLoading,
	thesaurusId,
	thesaurusName
} :{
	languages :Array<string>
	loading :boolean
	locales :Locales
	servicesBaseUrl :string
	setLoading :React.Dispatch<React.SetStateAction<boolean>>
	thesaurusId :string
	thesaurusName :string
}) {
	const [needsMigrationCount, setNeedsMigrationCount] = React.useState<number>();
	const [fromLanguage, setFromLanguage] = React.useState<string>();
	const [toLanguage, setToLanguage] = React.useState<string>();
	const [migrateTaskId, setMigrateTaskId] = React.useState<string>();
	const [migrating, setMigrating] = React.useState<boolean>(false);
	const [interval, setInterval] = React.useState<number>(1000);
	const [progress, setProgress] = React.useState<{
		error :boolean
		indicating :boolean
		label :string
		percent :number
		success :boolean
		total :number
		value :number
		warning :boolean
	}>({
		error: false,
		indicating: true,
		label: '',
		percent: 0,
		success: false,
		total: 1,
		value: 0,
		warning: false
	});

	React.useEffect(() => {
		setLoading(true);
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { // HTTP/2 uses lowercase header keys
				'content-type':	'application/json'
			},
			body: JSON.stringify(gql.query({
				operation: GQL_QUERY_SYNONYMS_NAME,
				fields: [
					'total',
				],
				variables: {
					count: {
						required: false,
						type: 'Int',
						value: 0
					},
					filters: {
						required: false,
						type: 'Filters',
						value: {
							boolean: {
								mustNot: {
									hasValue: {
										field: 'nodeTypeVersion',
										values: ["2"]
									} // hasValue
								} // mustNot
							} // boolean
						} // value
					}, // filters
					thesaurusNames: {
						list: true,
						required: false,
						type: "String",
						value: [thesaurusName]
					}
				} // variables
			}))
		}).then(res => res.json() as JSONResponse<{
			querySynonyms :{
				total :number
			}
		}>).then(({
			data: {
				querySynonyms: {
					total
				}
			}
		}) => {
			setNeedsMigrationCount(total);
			setLoading(false);
		})
	}, [
		servicesBaseUrl,
		setLoading,
		thesaurusName
	]);

	useInterval(() => {
		if (migrating) {
			fetch(`${servicesBaseUrl}/graphQL`, {
				method: 'POST',
				headers: { // HTTP/2 uses lowercase header keys
					'content-type':	'application/json'
				},
				body: JSON.stringify(gql.query({
					operation: 'getTask',
					fields: [
						//'application',
						//'description',
						//'id',
						//'name',
						{
							progress: [
								'current',
								//'info',
								'infoObj',
								'total'
							]
						},
						//'startTime',
						'state',
						//'user'
					],
					variables: {
						taskId: {
							required: true,
							type: 'ID',
							value: migrateTaskId
						}
					}
				}))
			})
				.then(res => res.json() as JSONResponse<{getTask :Task<{
					currentTime :number
					message :string
					startTime :number
				}>}>)
				.then(({
					data: {
						getTask: {
							//application,
							//description,
							//id,
							//name,
							progress: {
								current,
								//info,
								infoObj: {
									currentTime,
									message,
									startTime
								},
								total
							},
							//startTime,
							state,
							//user
						}
					}
				}) => {
					const remainingCount = total - current;
					const percent = Math.floor(current / total * 10000)/100; // Keeping two decimals
					const durationMs = currentTime - startTime;
					const averageMs = current ? durationMs / current : durationMs;
					const remainingMs = (remainingCount * averageMs);
					const etaMs = currentTime + remainingMs;
					const error = state === TASK_STATE_FAILED;
					const success = state === TASK_STATE_FINISHED;
					const warning = state === TASK_STATE_WAITING;
					setProgress({
						error,
						indicating: state === TASK_STATE_RUNNING || warning,
						label: warning
							? 'Task state waiting!'
							: error
								? `Task failed!`
								: success
									? message
									: `${message} etaMs:${etaMs}`,
						percent,
						success,
						total: total,
						value: current,
						warning
					});
					if (success || error) {
						setLoading(false);
						setMigrating(false);
						setInterval(5000);
					}
				})
		} // if migrateTaskId
	}, interval); // useInterval

	/*useUpdateEffect(() => {
		if (migrateTaskId) {
		}
	},[
		migrateTaskId
	]);*/

	if (needsMigrationCount === 0) {
		return null;
	}

	return <Segment>
		<Header as='h2' content='Migration'/>
		<Form.Field>
			<label>From Language</label>
			<LanguageDropdown
				disabled={loading}
				includeANoneOption={false}
				language={fromLanguage}
				loading={loading}
				locales={locales.filter(({tag}) => languages.includes(tag))}
				multiple={false}
				placeholder='Please select from language'
				setLanguage={(language) => setFromLanguage(language as string)}
			/>
		</Form.Field>
		<Form.Field>
			<label>To Language</label>
			<LanguageDropdown
				disabled={loading}
				includeANoneOption={false}
				language={toLanguage}
				loading={loading}
				locales={locales.filter(({tag}) => languages.includes(tag))}
				multiple={false}
				placeholder='Please select to language'
				setLanguage={(language) => setToLanguage(language as string)}
			/>
		</Form.Field>
		{migrateTaskId
			? <Progress
				error={progress.error}
				indicating={progress.indicating}
				label={progress.label}
				percent={progress.percent}
				progress='ratio'
				success={progress.success}
				total={progress.total}
				value={progress.value}
				warning={progress.warning}
			/>
			: null
		}
		<Button
			content={`Migrate ${needsMigrationCount} synonyms`}
			disabled={!!migrateTaskId || !fromLanguage || !toLanguage ||  loading}
			icon={{name: 'tasks'}}
			loading={migrating || loading}
			onClick={() => {
				setLoading(true);
				fetch(`${servicesBaseUrl}/graphQL`, {
					method: 'POST',
					headers: { // HTTP/2 uses lowercase header keys
						'content-type':	'application/json'
					},
					body: JSON.stringify(gql.mutation({
						operation: 'migrateThesaurusSynonyms_v1_to_v2',
						fields: [
							'taskId'
						],
						variables: {
							fromLocale: {
								required: true,
								type: 'String',
								value: fromLanguage
							},
							thesaurusId: {
								required: true,
								type: 'ID',
								value: thesaurusId
							},
							toLocale: {
								required: true,
								type: 'String',
								value: toLanguage
							}
						}
					}))
				})
					.then(res => res.json() as JSONResponse<{migrateThesaurusSynonyms_v1_to_v2 :{
						taskId :string
					}}>)
					.then(({
						data: {
							migrateThesaurusSynonyms_v1_to_v2: {
								taskId
							}
						}
					}) => {
						//console.debug('taskId', taskId);
						setMigrateTaskId(taskId);
						setMigrating(true);
						//setLoading(false);
					});
			}}
		/>
	</Segment>;
}
