import type {
	RepoConnection,
	ScheduledJob
} from '@enonic-types/lib-explorer';


import {
	DOT_SIGN,
	toStr,
	uniqueId
} from '@enonic/js-utils';
import {
	APP_EXPLORER,
	REPO_ID_EXPLORER
} from '/lib/explorer/index';
import {get as getCollection} from '/lib/explorer/collection/get';
import {setModel} from '/lib/explorer/model/setModel';
import {
	create as createJob,
	delete as deleteJob,
	//get as getJob,
	list as listJobs
	//@ts-ignore
} from '/lib/xp/scheduler';
import {Progress} from '../Progress';



export function model10({
	progress,
	writeConnection
} :{
	progress :Progress
	writeConnection :RepoConnection
}) {
	const jobs = listJobs() as Array<ScheduledJob<{
		collectionId :string
		name :string
	}>>;
	//log.debug(`jobs:${toStr(jobs)}`);

	jobs.forEach((job) => {
		//log.debug(`job:${toStr(job)}`);
		const {
			name
		} = job;
		//log.debug(`name:${toStr(name)}`);
		/*const fullJob = getJob({name}); // Not needed, list contains everything.
		log.debug(`fullJob:${toStr(fullJob)}`);*/
		if (name.startsWith(APP_EXPLORER)) {
			const {
				config: {
					collectionId: collectionIdAlreadyPresent,
					name: collectionName
				},
				descriptor
			} = job;

			if (!collectionIdAlreadyPresent) {
				progress.addItems(1).setInfo(`Renaming job ${name}`).report().logInfo();

				const jobPrefix = `${descriptor.replace(':', DOT_SIGN)}${DOT_SIGN}${collectionName}${DOT_SIGN}`;
				//log.debug(`jobPrefix:${toStr(jobPrefix)}`);

				const jobNumber = name.replace(jobPrefix, '');
				//log.debug(`jobNumber:${toStr(jobNumber)}`);

				//log.debug(`collectionName:${toStr(collectionName)}`);
				const collectionNode = getCollection({
					connection: writeConnection,
					name: collectionName
				});
				if (collectionNode) {
					//log.debug(`collectionNode:${toStr(collectionNode)}`);
					const {_id: collectionId} = collectionNode;
					//log.debug(`collectionId:${toStr(collectionId)}`);
					job.config.collectionId = collectionId; // Not using reference since this is in another repo.
					job.name = uniqueId({
						repoId: REPO_ID_EXPLORER,
						nodeId: collectionId,
						versionKey: jobNumber
					});
					//log.debug(`job.name:${toStr(job.name)}`);
					log.debug(`job:${toStr(job)}`);
					const createdJob = createJob(job);
					log.debug(`createdJob:${toStr(createdJob)}`);
					if (createdJob) {
						const deleteRes = deleteJob({name});
						log.debug(`deleteRes:${toStr(deleteRes)}`);
					}
				} else { // !collectionNode
					// A schedule exists for a collection that "no longer" exists
					// So delete the schedule
					log.warning(`Deleting schedule with name:${name} as collection:${collectionName} not found!`);
					const deleteRes = deleteJob({name});
					log.warning(`Deleted schedule with name:${name} as collection:${collectionName} not found! deleteRes:${toStr(deleteRes)}`);
				}
				progress.finishItem();
			}
		} // if (name.startsWith(APP_EXPLORER))
	}); // jobs.forEach

	setModel({
		connection: writeConnection,
		version: 10
	});
}
