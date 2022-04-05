export const ROOT_BLOCK = /* GraphQL */ `
  query root {
    root {
      __typename
      id
      children {
        ...BlocksDetails
      }
    }
  }

  fragment BlocksDetails on Block {
    __typename
    id
    ... on PageBlock {
      title
    }
    ... on TableBlock {
      name
      store {
        id
        subgraph
      }
    }
  }
`;
