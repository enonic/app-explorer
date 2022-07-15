import type {RequiredNodeProperties} from '/lib/explorer/types/index.d';
import type {SynonymNodeSpecific} from '../../../../../src/main/resources/tasks/init/model/16/modifySynonymNodeEditor';

//import {print} from 'q-i'; // DEBUG
import {deepStrictEqual} from 'assert';
import {modifySynonymNodeEditor} from '../../../../../src/main/resources/tasks/init/model/16/modifySynonymNodeEditor';

//@ts-ignore
const print = (v :unknown, o :unknown) => {/**/} // No DEBUG :)


const DEFAULT = {
	decideByType: true,
	enabled: true,
	fulltext: false,
	includeInAllText: false,
	indexValueProcessors: [],
	languages: [],
	nGram: false,
	path: false
};


describe('tasks', () => {
	describe('init', () => {
		describe('model', () => {
			describe('16', () => {
				describe('modifySynonymNodeEditor', () => {
					it('handles two different languages, with multiple synonyms', () => {
						const actual = modifySynonymNodeEditor({
							fromLanguage: 'no',
							synonymNode: {
								_indexConfig: {
									configs: [],
									default: DEFAULT
								},
								from: [
									'bilen',
									'bil'
								],
								thesaurusReference: 'thesaurusReference',
								to: [
									'autos',
									'auto'
								]
							} as RequiredNodeProperties & SynonymNodeSpecific,
							toLanguage: 'en'
						});
						print(actual, { maxItems: Infinity })
						deepStrictEqual(
							{
								_indexConfig: {
									configs: [{
										config: {
											decideByType: false,
											enabled: true,
											fulltext: true,
											includeInAllText: false,
											indexValueProcessors: [],
											languages: [],
											nGram: true,
											path: false
										},
										path: 'comment'
									},{
										config: {
											decideByType: false,
											enabled: true,
											fulltext: true,
											includeInAllText: false,
											indexValueProcessors: [],
											languages: [
												'en'
											],
											nGram: true,
											path: false
										},
										path: 'languages.en'
									},{
										config: {
											decideByType: false,
											enabled: true,
											fulltext: true,
											includeInAllText: false,
											indexValueProcessors: [],
											languages: [],
											nGram: true,
											path: false
										},
										path: 'languages.en.comment'
									},{
										config: {
											decideByType: false,
											enabled: true,
											fulltext: true,
											includeInAllText: false,
											indexValueProcessors: [],
											languages: [],
											nGram: true,
											path: false
										},
										path: 'languages.en.synonyms.comment'
									},{
										config: {
											decideByType: false,
											enabled: true,
											fulltext: true,
											includeInAllText: false,
											indexValueProcessors: [],
											languages: [
												'no'
											],
											nGram: true,
											path: false
										},
										path: 'languages.no'
									},{
										config: {
											decideByType: false,
											enabled: true,
											fulltext: true,
											includeInAllText: false,
											indexValueProcessors: [],
											languages: [],
											nGram: true,
											path: false
										},
										path: 'languages.no.comment'
									},{
										config: {
											decideByType: false,
											enabled: true,
											fulltext: true,
											includeInAllText: false,
											indexValueProcessors: [],
											languages: [],
											nGram: true,
											path: false
										},
										path: 'languages.no.synonyms.comment'
									}],
									default: DEFAULT
								},
								enabled: true,
								from: [
									'bilen',
									'bil'
								],
								languages: {  // two languages
									'en': {
										enabled: true,
										synonyms: [{
											enabled: true,
											synonym: 'auto' // sorted :)
										},{
											enabled: true,
											synonym: 'autos' // sorted :)
										}]
									},
									'no': {
										enabled: true,
										synonyms: [{
											enabled: true,
											synonym: 'bil'  // sorted :)
										},{
											enabled: true,
											synonym: 'bilen'  // sorted :)
										}]
									}
								},
								thesaurusReference: 'thesaurusReference',
								to: [
									'autos',
									'auto'
								]
							},
							actual
						);
					}); // it
					it('handles when from and to language is the same', () => {
						const actual = modifySynonymNodeEditor({
							fromLanguage: 'no',
							synonymNode: {
								_indexConfig: {
									configs: [],
									default: DEFAULT
								},
								from: 'bil',
								thesaurusReference: 'thesaurusReference',
								to: 'auto'
							} as RequiredNodeProperties & SynonymNodeSpecific,
							toLanguage: 'no'
						});
						print(actual, { maxItems: Infinity })
						deepStrictEqual(
							{
								_indexConfig: {
									configs: [{
										config: {
											decideByType: false,
											enabled: true,
											fulltext: true,
											includeInAllText: false,
											indexValueProcessors: [],
											languages: [],
											nGram: true,
											path: false
										},
										path: 'comment'
									},{
										config: {
											decideByType: false,
											enabled: true,
											fulltext: true,
											includeInAllText: false,
											indexValueProcessors: [],
											languages: [
												'no'
											],
											nGram: true,
											path: false
										},
										path: 'languages.no'
									},{
										config: {
											decideByType: false,
											enabled: true,
											fulltext: true,
											includeInAllText: false,
											indexValueProcessors: [],
											languages: [],
											nGram: true,
											path: false
										},
										path: 'languages.no.comment'
									},{
										config: {
											decideByType: false,
											enabled: true,
											fulltext: true,
											includeInAllText: false,
											indexValueProcessors: [],
											languages: [],
											nGram: true,
											path: false
										},
										path: 'languages.no.synonyms.comment'
									}],
									default: DEFAULT
								},
								enabled: true,
								from: 'bil',
								languages: {
									'no': { // just one language
										enabled: true,
										synonyms: [{
											enabled: true,
											synonym: 'auto' // sorted :)
										},
										{
											enabled: true,
											synonym: 'bil'
										}]
									}
								},
								thesaurusReference: 'thesaurusReference',
								to: 'auto'
							},
							actual
						);
					}); // it
				}); // describe modifySynonymNodeEditor
			}); // describe 16
		}); // describe model
	}); // describe init
}); // describe tasks
