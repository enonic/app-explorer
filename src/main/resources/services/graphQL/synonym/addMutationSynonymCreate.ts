import type {
	RepoConnection,
	Synonym,
	SynonymNodeCreateParams
} from '/lib/explorer/types/index.d';
import type {SynonymUse} from '/lib/explorer/types/Synonym.d';
import type {Glue} from '../Glue';


import {
	isSet,
	toStr
} from '@enonic/js-utils';
import {
	NT_INTERFACE,
	NT_SYNONYM,
	NT_THESAURUS,
	PRINCIPAL_EXPLORER_READ,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/constants';
import {get} from '/lib/explorer/node/get';
import {connect} from '/lib/explorer/repo/connect';
import {createRandomNamed} from '/lib/explorer/node/createRandomNamed';
import {buildSynonymIndexConfig} from '/lib/explorer/synonym/buildSynonymIndexConfig';
import {coerceSynonymType} from '/lib/explorer/synonym/coerceSynonymType';
import {
	GraphQLBoolean,
	GraphQLID,
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';
//@ts-ignore
import {reference as referenceValue} from '/lib/xp/value';
import {
	GQL_INPUT_TYPE_SYNONYM_LANGUAGE_NAME,
	GQL_TYPE_SYNONYM_NAME
} from '../constants';


export function getValidInterfaceIdReferences({
	explorerRepoReadConnection,
	interfaceIdsArray,
	interfaceIdsCheckedObject // modified within
} :{
	explorerRepoReadConnection :RepoConnection,
	interfaceIdsArray :ReadonlyArray<string>
	interfaceIdsCheckedObject :Record<string,boolean> // modified within
}) {
	const validInterfaceIds=[];
	for (let i = 0; i < interfaceIdsArray.length; i++) {
		const interfaceId = interfaceIdsArray[i];
		if (!isSet(interfaceIdsCheckedObject[interfaceId])) {
			const interfaceNode = explorerRepoReadConnection.get(interfaceId);
			//log.debug('interfaceNode:%s', toStr(interfaceNode));
			if (!interfaceNode) {
				log.warning(`Unable to find interface with id:${interfaceId}!`);
				interfaceIdsCheckedObject[interfaceId] = false;
			} else if (interfaceNode._nodeType !== NT_INTERFACE) {
				log.warning(`Node with id:${interfaceId} not an interface!`);
				interfaceIdsCheckedObject[interfaceId] = false;
			} else {
				interfaceIdsCheckedObject[interfaceId] = true;
			}
		}
		if (interfaceIdsCheckedObject[interfaceId]) {
			validInterfaceIds.push(referenceValue(interfaceId));
		}
	} // for interfaceIdsArray
	return validInterfaceIds;
}


function coerceSynonymGqlType({
	partialSynonymNode
} :{
	partialSynonymNode :Synonym & {
		_score ?:number
		thesaurus :string
	}
}) {
	const deref :Synonym & {
		_score ?:number
		thesaurus :string
	} = JSON.parse(JSON.stringify(partialSynonymNode));
	const locales = Object.keys(deref.languages);
	const languagesArray = [];
	for (let i = 0; i < locales.length; i++) {
	    const locale = locales[i];
		languagesArray.push({
			...deref.languages[locale],
			locale
		});
	}
	//@ts-ignore
	deref.languages = languagesArray;
	return deref;
}


export function addMutationSynonymCreate({
	glue
} :{
	glue :Glue
}) {
	glue.addMutation<{
		// Required
		thesaurusId :string
		// Optional
		comment ?:string
		disabledInInterfaces ?:Array<string>
		enabled ?:boolean
		languages ?:Array<{
			// Required
			locale :string
			// Optional
			comment ?:string
			disabledInInterfaces ?:Array<string>
			enabled ?:boolean
			synonyms ?:Array<{
				// Required
				synonym :string
				// Optional
				comment ?:string
				disabledInInterfaces ?:Array<string>
				enabled ?:boolean
				use ?:SynonymUse // default is to
			}>
		}>
	}>({
		name: 'createSynonym',
		args: {
			comment: GraphQLString,
			disabledInInterfaces: list(GraphQLID),
			enabled: GraphQLBoolean,
			languages: list(glue.getInputType(GQL_INPUT_TYPE_SYNONYM_LANGUAGE_NAME)),
			thesaurusId: glue.getScalarType('_id'),
		},
		resolve({
			args: {
				comment: commentArg = '',
				disabledInInterfaces: disabledInInterfacesArg = [],
				enabled: enabledArg = true,
				languages: languagesArg = [],
				thesaurusId
			}
		}) {
			//log.debug('commentArg:%s', toStr(commentArg));
			//log.debug('disabledInInterfacesArg:%s', toStr(disabledInInterfacesArg));
			//log.debug('enabledArg:%s', toStr(enabledArg));
			//log.debug('languagesArg:%s', toStr(languagesArg));
			//log.debug(`thesaurusId:${toStr(thesaurusId)}`);

			const explorerRepoReadConnection = connect({
				principals: [PRINCIPAL_EXPLORER_READ]
			});

			const thesaurusNode = get({
				connection: explorerRepoReadConnection,
				path: thesaurusId
			});
			//log.debug('synonymCreate thesaurusNode:%s', toStr(thesaurusNode));
			if (!thesaurusNode) {
				throw new Error(`Unable to find thesaurus with id:${thesaurusId}!`);
			}
			if (thesaurusNode._nodeType !== NT_THESAURUS) {
				throw new Error(`Node with id:${thesaurusId} not a thesaurus!`);
			}

			const interfaceIdsCheckedObject :Record<string,boolean> = {};
			const languages = {};
			for (let i = 0; i < languagesArg.length; i++) {
			    const {
					locale,
					comment: languageComment = '',
					disabledInInterfaces: languageDisabledInInterfaces = [],
					enabled: languageEnabled = true,
					synonyms: languageSynonyms = []
				} = languagesArg[i];
				const synonyms = [];
				for (let j = 0; j < languageSynonyms.length; j++) {
				    const {
						comment = '',
						disabledInInterfaces = [],
						enabled = true,
						synonym,
						use = 'to'
					} = languageSynonyms[j];
					if (synonym) {
						synonyms.push({
							comment,
							disabledInInterfaces: getValidInterfaceIdReferences({
								explorerRepoReadConnection,
								interfaceIdsArray: disabledInInterfaces,
								interfaceIdsCheckedObject // modified within
							}),
							enabled,
							synonym,
							use
						})
					}
				}
				languages[locale] = {
					comment: languageComment,
					disabledInInterfaces: getValidInterfaceIdReferences({
						explorerRepoReadConnection,
						interfaceIdsArray: languageDisabledInInterfaces,
						interfaceIdsCheckedObject // modified within
					}),
					enabled: languageEnabled,
					synonyms
				}
			} // for languagesArg
			//log.debug('languages:%s', toStr(languages));
			const createSynonymParams :SynonymNodeCreateParams = {
				_nodeType: NT_SYNONYM,
				_parentPath: thesaurusNode._path,
				comment: commentArg,
				disabledInInterfaces: getValidInterfaceIdReferences({
					explorerRepoReadConnection,
					interfaceIdsArray: disabledInInterfacesArg,
					interfaceIdsCheckedObject // modified within
				}),
				enabled: enabledArg,
				languages,
				thesaurusReference: referenceValue(thesaurusNode._id),
			};
			createSynonymParams._indexConfig = buildSynonymIndexConfig({
				partialSynonymNode: createSynonymParams
			});
			const createRes = createRandomNamed<SynonymNodeCreateParams>(createSynonymParams, {
				connection: connect({
					principals: [PRINCIPAL_EXPLORER_WRITE]
				})
			});
			if (!createRes) {
				log.error(`Something went wrong when trying to create synonym createSynonymParams:${toStr(createSynonymParams)} in thesaurus with id:${thesaurusId}`);
				throw new Error(`Something went wrong when trying to create synonym in thesaurus with id:${thesaurusId}!`);
			}
			//log.debug(`createRes:${toStr(createRes)}`);

			return coerceSynonymGqlType({
				partialSynonymNode: coerceSynonymType(
					//@ts-ignore // TODO
					createRes
				)
			});
		},
		type: glue.getObjectType(GQL_TYPE_SYNONYM_NAME)
	});
}