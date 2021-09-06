export const GQL_MUTATION_CREATE_SYNONYM = `mutation CreateSynonymMutation(
  $from: [String]!,
  $thesaurusId: String!,
  $to: [String]!
) {
  createSynonym(
    from: $from
    thesaurusId: $thesaurusId
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
