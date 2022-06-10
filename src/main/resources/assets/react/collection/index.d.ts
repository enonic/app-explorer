export type Cron = {
	minute :string
	hour :string
	dayOfMonth :string
	month :string
	dayOfWeek :string
}

export type QueryCollectionsHit = {
	_id :string
	_name :string
	_path :string
	collector :{
		name :string
		configJson :string
	}
	documentCount :number
	//interfaces :{}
	language :string
	documentTypeId :string
}

export type QueryCollectionsHits = Array<QueryCollectionsHit>

export type QueryCollectionsGraph = {
	total :number
	count :number
	page ?:number
	pageStart ?:number
	pageEnd ?:number
	pagesTotal ?:number
	hits :QueryCollectionsHits
}
