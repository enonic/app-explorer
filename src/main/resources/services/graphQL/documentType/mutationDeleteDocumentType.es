export const GQL_MUTATION_DELETE_DOCUMENT_TYPE = `mutation DeleteDocumentTypeMutation($_id: String!) {
  deleteDocumentType(_id: $_id) {
    _id
  }
}`;
