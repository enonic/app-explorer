export const GQL_MUTATION_DELETE_SYNONYM = `mutation DeleteSynonymMutation(
  $_id: ID!
) {
  deleteSynonym(
    _id: $_id
  ) {
    _id
  }
}`;
