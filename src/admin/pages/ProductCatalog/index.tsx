import * as React from "react";
import { NavLink } from "react-router-dom";
import {
  Box,
  Flex,
  Typography,
  SubNav,
  SubNavHeader,
  SubNavSection,
  SubNavSections,
  SubNavLink,
} from "@strapi/design-system";
import { GridFour, Folder, ShoppingCart } from "@strapi/icons";

const COLLECTION_TYPES = "/content-manager/collection-types";

/**
 * Sub-menu of the Product Catalog. Each link points at the collection's own
 * Content Manager list view, so editing happens with all of Strapi's native
 * tooling (filters, publish/draft, the configured field labels).
 */
const COLLECTIONS = [
  {
    to: `${COLLECTION_TYPES}/api::product-group.product-group`,
    label: "Product Groups",
    icon: <GridFour />,
  },
  {
    to: `${COLLECTION_TYPES}/api::product-category.product-category`,
    label: "Product Categories",
    icon: <Folder />,
  },
  {
    to: `${COLLECTION_TYPES}/api::product.product`,
    label: "Products",
    icon: <ShoppingCart />,
  },
];

const ProductCatalogPage = () => {
  return (
    <Flex alignItems="stretch" style={{ minHeight: "100vh" }}>
      <SubNav aria-label="Product Catalog">
        <SubNavHeader label="Product Catalog" />
        <SubNavSections>
          <SubNavSection label="Collections">
            {COLLECTIONS.map((collection) => (
              <SubNavLink
                key={collection.to}
                tag={NavLink}
                to={collection.to}
                icon={collection.icon}
              >
                {collection.label}
              </SubNavLink>
            ))}
          </SubNavSection>
        </SubNavSections>
      </SubNav>

      <Box padding={10} flex={1}>
        <Flex direction="column" alignItems="flex-start" gap={4}>
          <Typography variant="alpha" tag="h1">
            Product Catalog
          </Typography>
          <Typography variant="epsilon" textColor="neutral600">
            Manage the product master data served by the catalog APIs. Pick a
            collection on the left to view and edit its records.
          </Typography>
        </Flex>
      </Box>
    </Flex>
  );
};

export { ProductCatalogPage };
export default ProductCatalogPage;
