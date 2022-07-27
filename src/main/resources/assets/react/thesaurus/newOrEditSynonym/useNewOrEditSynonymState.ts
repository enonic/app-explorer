import type {Thesaurus} from '/lib/explorer/types/index.d';
import type {SynonymGUIState} from '/lib/explorer/types/Synonym.d';
import type {JSONResponse}  from '../../../../services/graphQL/fetchers/index.d';


import * as gql from 'gql-query-builder';
import * as React from 'react';

// NOTE: Must resolve transpile- and bundle- time.
//import {GQL_MUTATION_CREATE_SYNONYM} from '../../../../services/graphQL/synonym/mutationCreateSynonym';
//import {GQL_MUTATION_UPDATE_SYNONYM} from '../../../../services/graphQL/synonym/mutationUpdateSynonym';


export function useNewOrEditSynonymState({
	// Required
	servicesBaseUrl,
	thesaurusId,
	// Optional
	afterClose = () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
	beforeOpen = () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
} :{
	// Required
	servicesBaseUrl :string
	thesaurusId :string
	// Optional
	afterClose ?:() => void
	beforeOpen ?:() => void
}) {
	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	const [loading, setLoading] = React.useState(false);
	const [open, setOpen] = React.useState(false);
	const [thesaurusLanguages, setThesaurusLanguages] = React.useState<Array<string>>([]);
	const [interfaceOptions, setInterfaceOptions] = React.useState<Array<{
		content ?:string
		text :string
		value :string
	}>>([]);
	const [state, setState] = React.useState<SynonymGUIState>({
		comment: 'Comment across all languages',
		enabled: true,
		disabledInInterfaces: [],
		languages: {
			'zxx': {
				comment: 'ATC codes',
				enabled: true,
				disabledInInterfaces: [],
				synonyms: [{
					comment: 'A specific ATC code',
					enabled: true,
					disabledInInterfaces: [],
					synonym: 'A01AA02',
					use: 'from'
				}]
			},
			'no': {
				comment: 'Disse synonymene er nyttige.',
				enabled: true,
				disabledInInterfaces: [],
				synonyms: [{
					comment: 'Et kult norsk synonym',
					enabled: true,
					disabledInInterfaces: [],
					synonym: 'natriummonofluorofosfat',
					use: 'to'
				}]
			},
			'en': {
				comment: 'Comment for english language',
				enabled: true,
				disabledInInterfaces: [],
				synonyms: [{
					comment: 'Comment for specific synonym in english',
					enabled: true,
					disabledInInterfaces: [],
					synonym: 'sodium monofluorophosphate',
					use: 'to'
				}]
			}
		}
	});

	//──────────────────────────────────────────────────────────────────────────
	// Functions
	//──────────────────────────────────────────────────────────────────────────
	const fetchState = ({
		_id,
		servicesBaseUrl
	} :{
		_id :string
		servicesBaseUrl :string
	}) => {
		setLoading(true);
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify(gql.query([{
				operation: 'getThesaurus',
				fields: [
					//'_id',
					//'_name',
					//'_path',
					//'_versionKey',
					'allowedLanguages'//,
					//'description'
				],
				variables: {
					_id: {
						required: true,
						type: 'ID',
						value: _id
					}
				}
			},{
				operation: 'queryInterfaces',
				fields: [{
					hits: [
						'_id',
						'_name'
					]
				}],
				variables: {
					count: {
						type: 'Int',
						value: -1
					}
				}
			}]))
		})
			.then(res => res.json() as JSONResponse<{
				getThesaurus :Thesaurus
				queryInterfaces :{
					hits :Array<{
						_id :string
						_name :string
					}>
				}
			}>)
			.then(({
				data: {
					getThesaurus: {
						allowedLanguages
					},
					queryInterfaces: {
						hits
					}
				}
			}) => {
				setThesaurusLanguages(allowedLanguages);
				setInterfaceOptions(hits.map(({_id, _name}) => ({
					text: _name,
					value: _id
				})));
				setLoading(false);
			});
	}; // fetchState

	function doClose() {
		setOpen(false); // This needs to be before unmount.
		afterClose(); // This could trigger render in parent, and unmount this Component.
	}

	// Made doOpen since onOpen doesn't get called consistently.
	const doOpen = () => {
		fetchState({
			_id: thesaurusId,
			servicesBaseUrl
		});
		beforeOpen();
		setOpen(true);
	};

	return {
		doClose,
		doOpen,
		interfaceOptions,
		loading,
		open,
		setState,
		state,
		thesaurusLanguages
	};
} // function useNewOrEditSynonymState
