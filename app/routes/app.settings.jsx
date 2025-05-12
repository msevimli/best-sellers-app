import {
  Box,
  Card,
  Page,
  Text,
  BlockStack,
  InlineGrid,
  Divider,
  TextField,
  useBreakpoints,
  Button,
  ChoiceList

} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";
import { json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";

// Import db prisma client
import db from "../db.server";

export async function loader() {
  // get data from database
  let settings = await db.settings.findFirst();
  return json(settings);
}

export async function action({ request }) {
  // updates persistent data
  let settings = await request.formData();
  settings = Object.fromEntries(settings);
  const sortType = settings.isReverse == "true" ? true : false;

  //Update database
  await db.settings.upsert({
    where: {
      id: '1'
    },
    update: {
      id: '1',
      title: settings.title,
      productCount: parseInt(settings.productCount),
      isReverse: sortType
    },
    create: {
      id: '1',
      title: settings.title,
      productCount: parseInt(settings.productCount),
      isReverse: sortType
    }
  });
  return json(settings);
}

export default function SettingsPage() {
  const { smUp } = useBreakpoints();
  const settings = useLoaderData();
  const [formState, setFormState] = useState(settings);
  const [selected, setSelected] = useState([formState?.isReverse === true ? 'true' : 'false']);
  const handleChange = useCallback((value) => {
    setSelected(value);
    setFormState((prev) => ({
      ...prev,
      isReverse: value[0]
    }));
  }, []);
  return (
    <Page>
      <TitleBar title="Settings" />
      <BlockStack gap={{ xs: "800", sm: "400" }}>
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: 400, sm: 0 }}
            paddingInlineEnd={{ xs: 400, sm: 0 }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Best Sellers
              </Text>
              <Text as="p" variant="bodyMd">
                Some set for Best Sellers App configuration
              </Text>
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            <Form method="POST" >
              <BlockStack gap="400">
                <TextField label="Section Title" name="title" value={formState?.title} onChange={(value) => setFormState({ ...formState, title: value })} />
                <TextField label="Product Count" name="productCount"
                  value={formState?.productCount}
                  type="number"
                  min="1"
                  max="12"
                  onChange={(value) => setFormState({ ...formState, productCount: value })} />

                <ChoiceList
                  title="Sort Type"
                  name="isReverse"
                  choices={[
                    { label: 'ASC', value: 'false' },
                    { label: 'DESC', value: 'true' },
                  ]}
                  selected={selected}
                  onChange={handleChange}  
                />
                <Button submit={true}>Save</Button>
              </BlockStack>
            </Form>
          </Card>
        </InlineGrid>
        {smUp ? <Divider /> : null}
      </BlockStack>
    </Page>
  );
}