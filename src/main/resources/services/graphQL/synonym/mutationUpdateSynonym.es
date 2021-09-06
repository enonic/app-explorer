export const GQL_MUTATION_UPDATE_SYNONYM = `mutation UpdateSynonymMutation(
  $_id: String!,
  $from: [String]!,
  $to: [String]!
) {
  updateSynonym(
    _id: $_id
    from: $from
    to: $to
  ) {
    _id
    _nodeType
    _path
    from
    thesaurus
    thesaurusReference
    to
  }
}`;
