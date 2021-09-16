export const GQL_MUTATION_FIELD_DELETE = `mutation DeleteField($_id: String!) {
  deleteField(_id: $_id) {
    _id
  }
}`;
