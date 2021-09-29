import React from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { Page, Layout, EmptyState, Button, Card } from "@shopify/polaris";
import { ResourcePicker, TitleBar } from "@shopify/app-bridge-react";
import store from "store-js";
import ResourceListWithProducts from "./components/ResourceList";

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

class IndexPage extends React.Component {
  state = { open: false };

  handleSelection = (resources) => {
    const idsFromResources = resources.selection.map((product) => product.id);
    this.setState({ open: false });
    store.set('ids', idsFromResources);
  }

  render() {
    // A constant that defines your app's empty state
    const emptyState = !store.get('ids');
    return (
      <Page>
        <TitleBar
          primaryAction={{
            content: 'Select products',
            onAction: () => this.setState({ open: true })
          }}
        />
        <ResourcePicker
          resourceType="Product"
          showVariants={false}
          open={this.state.open}
          onSelection={this.handleSelection}
          onCancel={() => this.setState({ open: false })}
        />
        {emptyState ? (
          <Layout>
            <EmptyState
              heading="Discount your products temporarily"
              action={{
                content: "Select products",
                onAction: () => this.setState({ open: true }),
              }}
              image={img}
            >
              <p>Select products to change their price temporarily.</p>
            </EmptyState>
          </Layout>
        ) : (
          // Uses the new resource list that retrives products by IDs
          <ResourceListWithProducts />
        )}
      </Page>
    );
  }
}

export default IndexPage;
