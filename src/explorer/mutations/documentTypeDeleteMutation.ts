export const GQL_MUTATION_DOCUMENT_TYPE_DELETE = `mutation DeleteDocumentTypeMutation($_id: ID!) {
  deleteDocumentType(_id: $_id) {
    _id
  }
}`;
