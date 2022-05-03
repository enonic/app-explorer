export const GQL_MUTATION_FIELD_DELETE = `mutation DeleteField($_id: ID!) {
  deleteField(_id: $_id) {
    _id
  }
}`;
