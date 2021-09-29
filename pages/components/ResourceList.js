import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Card, ResourceList, Stack, TextStyle, Thumbnail } from '@shopify/polaris';
import store from 'store-js';
import { Redirect } from '@shopify/app-bridge/actions';
import { Context } from '@shopify/app-bridge-react';
import ApplyRandomPrices from "./ApplyRandomPrices";

// GraphQL query to retrieve products by IDs.
// The price field belongs to the variants object because
// variantions of a product can have different prices.
const GET_PRODUCTS_BY_ID = gql`
  query getProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        title
        handle
        descriptionHtml
        id
        images(first: 1) {
          edges {
            node {
              originalSrc
              altText
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              price
              id
            }
          }
        }
      }
    }
  }
`;

class ResourceListWithProducts extends React.Component {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.state = {
      selectedItems: [],
      selectedNodes: {},
    }
  }
  render() {
    const app = this.context;
    return (
      // GraphQL query to retrieve products and their prices
      <Query query={GET_PRODUCTS_BY_ID} variables={{ ids: store.get('ids') }}>
        {({ data, loading, error, refetch }) => {
          if (loading) {
            return <div>Loading...</div>
          }

          if (error) {
            return <div>{error.message}</div>
          }

          const nodesById = {};
          data.nodes.forEach((node) => nodesById[node.id] = node);

          return (
            <>
              <Card>
                <ResourceList
                  showHeader
                  resourceName={{ singular: 'Products', plural: 'Proudcts' }}
                  items={data.nodes}
                  selectable
                  selectedItems={this.state.selectedItems}
                  onSelectionChange={(selectedItems) => {
                    const selectedNodes = {};
                    selectedItems.forEach((item) => {
                      selectedNodes[item] = nodesById[item];
                    });
                    return this.setState({
                      selectedItems: selectedItems,
                      selectedNodes: selectedNodes,
                    });
                  }}
                  renderItem={(item) => {
                    const media = (
                      <Thumbnail
                        source={
                          item.images.edges[0] != null ? item.images.edges[0].node.orignalSrc : ''
                        }
                        alt={
                          item.images.edges[0] != null ? item.images.edges[0].node.altText : ''
                        }
                      />
                    );
                    const price = item.variants.edges[0].node.price;
                    return (
                      <ResourceList.Item
                        id={item.id}
                        media={media}
                        accessibilityLabel={`View details for ${item.title}`}
                        onClick={() => {
                          let index = this.state.selectedItems.indexOf(item.id);
                          const node = nodesById[item.id];
                          if (index === -1) {
                            this.state.selectedItems.push(item.id);
                            this.state.selectedNodes[item.id] = node;
                          } else {
                            this.state.selectedItems.splice(index, 1);
                            delete this.state.selectedNodes[item.id];
                          }

                          this.setState({
                            selectedItems: this.state.selectedItems,
                            selectedNodes: this.state.selectedNodes,
                          });
                        }}
                      >
                        <Stack>
                          <Stack.Item fill>
                            <h3>
                              <TextStyle variation="strong">
                                {item.title}
                              </TextStyle>
                            </h3>
                          </Stack.Item>
                          <Stack.Item>
                            <p>${price}</p>
                          </Stack.Item>
                        </Stack>
                      </ResourceList.Item>
                    );
                  }}
                />
              </Card>
              <ApplyRandomPrices
                selectedItems={this.state.selectedNodes}
                onUpdate={refetch}
              />
            </>
          );
        }}
      </Query>
    );
  }
}

export default ResourceListWithProducts;
