export interface QueryDocumentsResult {
    total: number
    hits: {
        _id: string
        _highlight: Record<string,string[]>
        parsedJson: Record<string,unknown>
    }[]
}
