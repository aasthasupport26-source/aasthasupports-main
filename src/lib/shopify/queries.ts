import { gql } from "graphql-request";

export const GET_PRODUCTS_QUERY = gql`
  query GetProducts($first: Int!, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query) {
      edges {
        node {
          id
          handle
          title
          productType
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                availableForSale
                quantityAvailable
              }
            }
          }
          metafields(
            identifiers: [
              { namespace: "custom", key: "category" }
              { namespace: "custom", key: "benefits" }
              { namespace: "custom", key: "certified" }
            ]
          ) {
            key
            value
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_PRODUCT_BY_HANDLE_QUERY = gql`
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
        }
      }
      metafields(
        identifiers: [
          { namespace: "custom", key: "category" }
          { namespace: "custom", key: "benefits" }
          { namespace: "custom", key: "certified" }
        ]
      ) {
        key
        value
      }
    }
  }
`;

export const CREATE_CART_MUTATION = gql`
  mutation CreateCart($lines: [CartLineInput!]!, $attributes: [AttributeInput!]) {
    cartCreate(input: { lines: $lines, attributes: $attributes }) {
      cart {
        id
        checkoutUrl
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                  }
                }
              }
            }
          }
        }
        attributes {
          key
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const GET_CUSTOMER_ORDERS_QUERY = gql`
  query GetCustomerOrders($customerAccessToken: String!, $first: Int!) {
    customer(customerAccessToken: $customerAccessToken) {
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPriceV2 {
              amount
              currencyCode
            }
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    price {
                      amount
                    }
                    image {
                      url
                    }
                  }
                  originalTotalPrice {
                    amount
                  }
                }
              }
            }
            successfulFulfillments(first: 1) {
              trackingCompany
              trackingInfo(first: 1) {
                number
                url
              }
            }
          }
        }
      }
    }
  }
`;

export const ADJUST_INVENTORY_MUTATION = gql`
  mutation AdjustInventory($inventoryItemId: ID!, $delta: Int!) {
    inventoryAdjustQuantity(input: { inventoryLevelId: $inventoryItemId, availableDelta: $delta }) {
      inventoryLevel {
        id
        available
      }
      userErrors {
        field
        message
      }
    }
  }
`;
