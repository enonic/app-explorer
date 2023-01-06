export interface JsonModalState {
    open: boolean
    id: string
    parsedJson: Record<string,unknown>
}

export interface QueryDocumentsResult {
    total: number
    hits: {
        _id: string
        _highlight: Record<string,string[]>
        parsedJson: Record<string,unknown>
    }[]
}