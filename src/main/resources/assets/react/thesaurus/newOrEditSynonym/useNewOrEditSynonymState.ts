import type IQueryBuilderOptions from 'gql-query-builder/build/IQueryBuilderOptions.d';
import type {
	//Synonym,
	Thesaurus
} from '/lib/explorer/types/index.d';
import type {
	Synonym_Common,
	Synonym_Language,
	SynonymGUI,
	SynonymGUI_Language,
	SynonymGUI_LanguagesSynonymObject
} from '/lib/explorer/types/Synonym.d';
import type {JSONResponse}  from '../../../../services/graphQL/fetchers/index.d';


import fastDeepEqual from 'fast-deep-equal/react';
import * as gql from 'gql-query-builder';
import * as React from 'react';

// NOTE: Must resolve transpile- and bundle- time.
import {GQL_INPUT_TYPE_SYNONYM_LANGUAGE_NAME} from '../../../../services/graphQL/constants';
//import {GQL_MUTATION_CREATE_SYNONYM} from '../../../../services/graphQL/synonym/mutationCreateSynonym';
//import {GQL_MUTATION_UPDATE_SYNONYM} from '../../../../services/graphQL/synonym/mutationUpdateSynonym';


const EMPTY_LANGUAGE :Omit<Synonym_Language,'locale'> = {
	both: [/*{
		comment: '',
		enabled: true,
		disabledInInterfaces: [],
		synonym: ''
	}*/],
	comment: '',
	enabled: true,
	disabledInInterfaces: [],
	from: [/*{
		comment: '',
		enabled: true,
		disabledInInterfaces: [],
		synonym: ''
	}*/],
	to: [/*{
		comment: '',
		enabled: true,
		disabledInInterfaces: [],
		synonym: ''
	}*/]
};


function gUIToSynonymLanguage({
	synonymGUILanguage
} :{
	synonymGUILanguage :SynonymGUI_Language
}) :Synonym_Language {
	const {
		synonyms,
		...rest
	} = synonymGUILanguage;
	const rv :Synonym_Language = {
		...rest,
		both: [],
		from: [],
		to: []
	};
	for (let i = 0; i < synonyms.length; i++) {
	    const {use, ...etc} = synonyms[i];
		rv[use].push(etc);
	}
	return rv;
}


function synonymLanguageToGUI({
	synonymLanguage
} :{
	synonymLanguage :Synonym_Language
}) :SynonymGUI_Language {
	const {both, from, to, ...rest} = synonymLanguage;
	const synonyms :Array<SynonymGUI_LanguagesSynonymObject> = [];
	for (let i = 0; i < both.length; i++) {
	    synonyms.push({
			...both[i],
			use: 'both'
		});
	}
	for (let i = 0; i < from.length; i++) {
	    synonyms.push({
			...from[i],
			use: 'from'
		});
	}
	for (let i = 0; i < to.length; i++) {
	    synonyms.push({
			...to[i],
			use: 'to'
		});
	}
	return {
		...rest,
		synonyms
	}
}

function gUIToSynonym({
	synonymGUI
} :{
	synonymGUI :SynonymGUI
}) :Synonym_Common {
	const deref = JSON.parse(JSON.stringify(synonymGUI));
	for (let i = 0; i < deref.languages.length; i++) {
		deref.languages[i] = gUIToSynonymLanguage({
			synonymGUILanguage: deref.languages[i]
		})
	}
	return deref;
}


function synonymToGUI({
	synonym
} :{
	synonym :Synonym_Common
}) :SynonymGUI {
	const deref = JSON.parse(JSON.stringify(synonym));
	for (let i = 0; i < deref.languages.length; i++) {
		deref.languages[i] = synonymLanguageToGUI({
			synonymLanguage: deref.languages[i]
		})
	}
	return deref;
}


export function useNewOrEditSynonymState({
	// Required
	servicesBaseUrl,
	thesaurusId,
	// Optional
	_id,
	afterClose = () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
	beforeOpen = () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
} :{
	// Required
	servicesBaseUrl :string
	thesaurusId :string
	// Optional
	_id ?:string
	afterClose ?:() => void
	beforeOpen ?:() => void
}) {
	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	const [loading, setLoading] = React.useState(false);
	const [open, setOpen] = React.useState(false);
	const [interfaceOptions, setInterfaceOptions] = React.useState<Array<{
		content ?:string
		text :string
		value :string
	}>>([]);
	const [initialState, setInitialState] = React.useState<Synonym_Common>({
		comment: '',
		enabled: true,
		disabledInInterfaces: [],
		languages: []
	});
	const [state, setState] = React.useState<SynonymGUI>(synonymToGUI({
		synonym: initialState
	}));

	//──────────────────────────────────────────────────────────────────────────
	// Functions (no internal state dependencies)
	//──────────────────────────────────────────────────────────────────────────
	const fetchState = () => {
		const queries :Array<IQueryBuilderOptions> = [{
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
				thesaurusId: {
					name: '_id',
					required: true,
					type: 'ID',
					value: thesaurusId
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
				interfaceCount: {
					name: 'count',
					type: 'Int',
					value: -1
				}
			}
		}];
		if (_id) {
			queries.push({
				operation: 'getSynonym',
				fields:[
					/*'_id',
					'_name',
					'_nodeType',
					'_path',
					'_versionKey',*/
					'comment',
					'disabledInInterfaces',
					'enabled',
					{
						languages: [
							'locale',
							{
								both: [
									'comment',
									'disabledInInterfaces',
									'enabled',
									'synonym'
								]
							},
							'comment',
							'disabledInInterfaces',
							'enabled',
							{
								from: [
									'comment',
									'disabledInInterfaces',
									'enabled',
									'synonym'
								]
							},
							{
								to: [
									'comment',
									'disabledInInterfaces',
									'enabled',
									'synonym'
								]
							}
						]
				  }/*,
				   'thesaurus',
				   'thesaurusReference'*/
				],
				variables: {
					synonymId: {
						name: '_id',
						type: 'ID',
						required: true,
						value: _id
					}
				}
			});
		}
		setLoading(true);
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify(gql.query(queries))
		})
			.then(res => res.json() as JSONResponse<{
				getSynonym :Synonym_Common
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
					getSynonym,
					getThesaurus: {
						allowedLanguages
					},
					queryInterfaces: {
						hits
					}
				}
			}) => {
				setInterfaceOptions(hits.map(({_id, _name}) => ({
					text: _name,
					value: _id
				})));
				let newInitialState :Synonym_Common;
				if (getSynonym) {
					newInitialState = getSynonym;
				} else {
					newInitialState = {
						comment: '',
						disabledInInterfaces: [],
						enabled: true,
						languages: []
					}
				}
				const seenLanguages :Array<string>= [];
				for (let i = 0; i < newInitialState.languages.length; i++) {
				    const {locale} = newInitialState.languages[i];
					seenLanguages.push(locale);
				}
				//console.debug('seenLanguages:', seenLanguages);
				const unseenLanguages = allowedLanguages.filter((x) => !seenLanguages.includes(x));
				for (let i = 0; i < unseenLanguages.length; i++) {
				    const unseenLanguage = unseenLanguages[i];
					//console.debug('unseenLanguage:', unseenLanguage);
					newInitialState.languages.push({
						locale: unseenLanguage,
						...EMPTY_LANGUAGE
					});
				}
				//console.debug('newInitialState:', newInitialState);
				setInitialState(newInitialState);
				setLoading(false);
			});
	}; // fetchState

	// Made doOpen since onOpen doesn't get called consistently.
	const doOpen = () => {
		fetchState();
		beforeOpen();
		setOpen(true);
	};

	//──────────────────────────────────────────────────────────────────────────
	// Callbacks (props and/or state dependencies)
	//──────────────────────────────────────────────────────────────────────────
	const doClose = React.useCallback(() => {
		setOpen(false); // This needs to be before unmount.
		afterClose(); // This could trigger render in parent, and unmount this Component.
	}, [
		afterClose
	]);

	const resetState = React.useCallback(() => {
		setState(synonymToGUI({
			synonym: initialState
		}));
	}, [
		initialState
	]);

	const submit = React.useCallback(() => {
		const synonym = gUIToSynonym({
			synonymGUI: state
		});
		const variables :IQueryBuilderOptions['variables']= {
			comment: {
				required: false,
				type: 'String',
				value: synonym.comment
			},
			enabled: {
				required: false,
				type: 'Boolean',
				value: synonym.enabled
			},
			disabledInInterfaces: {
				list: true,
				required: false,
				type: 'ID',
				value: synonym.disabledInInterfaces
			},
			languages: {
				list: true,
				required: false,
				type: GQL_INPUT_TYPE_SYNONYM_LANGUAGE_NAME,
				value: synonym.languages
			}
		};
		if (_id) {
			variables['_id'] = {
				type: 'ID',
				required: true,
				value: _id
			}
		} else {
			variables['thesaurusId'] = {
				type: 'ID',
				required: true,
				value: thesaurusId
			}
		}
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify(gql.mutation({
				operation: _id ? 'updateSynonym' : 'createSynonym',
				variables,
				fields: ['_id'],
			}))
		}).then((response) => {
			if (response.status === 200) { doClose(); }
		});
	}, [
		_id,
		doClose,
		servicesBaseUrl,
		state,
		thesaurusId
	]);

	//──────────────────────────────────────────────────────────────────────────
	// Effects
	//──────────────────────────────────────────────────────────────────────────
	React.useEffect(() => {
		resetState()
	}, [
		resetState // the callback changes when initialState changes :)
	]);

	return {
		doClose,
		doOpen,
		interfaceOptions,
		isStateChanged: !fastDeepEqual(gUIToSynonym({
			synonymGUI: state
		}), initialState),
		loading,
		open,
		resetState,
		setState,
		state,
		submit
	};
} // function useNewOrEditSynonymState
