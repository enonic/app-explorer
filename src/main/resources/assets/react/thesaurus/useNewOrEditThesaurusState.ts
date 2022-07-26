import type {Thesaurus} from '/lib/explorer/types/index.d';
import type {JSONResponse}  from '../../../services/graphQL/fetchers/index.d';


import fastDeepEqual from 'fast-deep-equal/react';
import * as gql from 'gql-query-builder';
import * as React from 'react';
import {mustStartWithALowercaseLetter} from '../utils/mustStartWithALowercaseLetter';
import {notDoubleUnderscore} from '../utils/notDoubleUnderscore';
import {onlyLowercaseAsciiLettersDigitsAndUnderscores} from '../utils/onlyLowercaseAsciiLettersDigitsAndUnderscores';
import {required} from '../utils/required';
import {useUpdateEffect} from '../utils/useUpdateEffect';


declare type Name = string
declare type State = {
	_name :Name
	languages :Array<string>
}
declare type VariableOption<
	List extends boolean = false,
	Type extends 'string'|'ID' = 'string',
	TypeScriptType = Type extends 'string'
		? string
		: Type extends 'ID'
		 ? string
		 : unknown,
	Value = List extends true
		? Array<TypeScriptType>
		: TypeScriptType
> = {
	value :Value
    list ?:List
	name ?:string
	required ?:boolean
	type ?:Type
}


export function useNewOrEditThesaurusState({
	_id,
	doClose,
	servicesBaseUrl,
	thesaurusNames
} :{
	_id ?:string
	doClose :() => void
	servicesBaseUrl :string
	thesaurusNames :Array<string>
}) {
	//──────────────────────────────────────────────────────────────────────────
	// Initial state (fetched from server)
	//──────────────────────────────────────────────────────────────────────────
	const [initialState, setInitialState] = React.useState<State>({
		_name: '',
		languages: []
	});

	//──────────────────────────────────────────────────────────────────────────
	// Fetch state from server ONLY ONCE on "mount"
	//──────────────────────────────────────────────────────────────────────────
	const getThesaurus = ({
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
			body: JSON.stringify(gql.query({
				operation: 'getThesaurus',
				fields: [
					'_id',
					'_name',
					'_path',
					'_versionKey',
					'allowedLanguages',
					'description'
				],
				variables: {
					_id: {
						required: true,
						type: 'ID',
						value: _id
					}
				}
			}))
		})
			.then(res => res.json() as JSONResponse<{getThesaurus :Thesaurus}>)
			.then(({
				data: {
					getThesaurus: {
						_name,
						allowedLanguages: languages
					}
				}
			}) => {
				/*console.debug('Setting initialState to', {
					_name,
					languages
				});*/
				setInitialState({
					_name,
					languages
				});
				setLoading(false);
			});
	};

	React.useEffect(() => {
		//console.debug('useEffect _id:', _id);
		if (_id) {
			getThesaurus({
				_id,
				servicesBaseUrl
			});
		} else {
			setInitialState({
				_name: '',
				languages: []
			});
		}
	},[
		_id,
		servicesBaseUrl
	]);
	//console.debug('initialState:', initialState);

	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	const [name, setName] = React.useState<Name>(initialState._name); // Changes onMount
	//console.debug('name:', name);

	const [nameError, setNameError] = React.useState<false|string>(false);
	//const [/*nameVisited*/, setNameVisited] = React.useState(false);

	const [languages, setLanguages] = React.useState<Array<string>>(initialState.languages); // Changes onMount
	//console.debug('languages:', languages);

	const [loading, setLoading] = React.useState(false);

	//──────────────────────────────────────────────────────────────────────────
	// Callbacks (only depend on props, not state)
	//──────────────────────────────────────────────────────────────────────────
	const mustBeUnique = React.useCallback((v :string) => {
		if (thesaurusNames.includes(v)) {
			return `Name must be unique: Name '${v}' is already in use!`;
		}
	}, [thesaurusNames]);

	const validateName = React.useCallback((nameToValidate :string) => {
		const newNameError = _id ? false : required(nameToValidate)
			|| mustStartWithALowercaseLetter(nameToValidate)
			|| onlyLowercaseAsciiLettersDigitsAndUnderscores(nameToValidate)
			|| notDoubleUnderscore(nameToValidate)
			|| mustBeUnique(nameToValidate);
		setNameError(newNameError);
		return !newNameError;
	}, [_id, mustBeUnique]);

	const validateForm = React.useCallback(({
		name
	}) => {
		/*console.debug('validateForm', {
			name
		});*/
		const nameValid = validateName(name);
		return nameValid// && fromLanguageValid && toLanguageValid;
	}, [
		validateName
	]);

	//──────────────────────────────────────────────────────────────────────────
	// Updates
	//──────────────────────────────────────────────────────────────────────────
	useUpdateEffect(() => {
		//console.debug('useUpdateEffect initialState:', initialState);
		setName(initialState._name);
		setLanguages(initialState.languages);
	}, [
		initialState
	]);

	//──────────────────────────────────────────────────────────────────────────
	// Event callbacks
	//──────────────────────────────────────────────────────────────────────────
	const nameOnBlur = React.useCallback((currentName :string) => {
		//setNameVisited(true);
		validateName(currentName);
	}, [validateName]);

	const nameOnChange = React.useCallback((
		_event :React.ChangeEvent<HTMLInputElement>,
		{value: newName}
	) => {
		setName(newName);
		validateName(newName);
	}, [validateName]);

	function resetState() {
		//setNameVisited(false);

		if (_id) {
			getThesaurus({
				_id,
				servicesBaseUrl
			});
		} else {
			setName(initialState._name);
			setLanguages(initialState.languages);
		}

		setNameError(false);
	}

	function onSubmit() {
		setLoading(true);
		if (!validateForm({
			name
		})) {
			setLoading(false);
			return;
		}
		const variables :{
			_name :VariableOption
			allowedLanguages :VariableOption<true>
			_id ?:VariableOption<false,'ID'>
		} = {
			_name: {
				required: true,
				value: name
			}, // TODO Support rename?
			allowedLanguages: {
				list: true,
				required: true,
				//type: 'string',
				value: languages
			}
		}
		if (_id) {
			variables._id = {
				required: true,
				type: 'ID',
				value: _id
			};
		}
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify(gql.mutation({
				operation: _id ? 'updateThesaurus' : 'createThesaurus',
				variables,
				fields: [
					'_id',
					'_name',
					'_path',
					'_versionKey',
					'allowedLanguages',
					'description'
				]
			})),
		}).then((response) => {
			if (response.status === 200) {
				doClose();
			}
			setLoading(false);
		});
	}

	//──────────────────────────────────────────────────────────────────────────

	return {
		errorCount: (nameError ? 1 : 0),
		loading,
		isStateChanged: !fastDeepEqual({
			_name: name,
			languages
		}, initialState),
		name,
		nameError,
		nameOnBlur,
		nameOnChange,
		languages,
		onSubmit,
		resetState,
		setLanguages
	};
}
