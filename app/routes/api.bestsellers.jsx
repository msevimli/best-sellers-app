import { json } from "@remix-run/node";
import db from "../db.server";
import { cors } from "remix-utils/cors";

export async function loader({ request }) {
    const SHOPIFY_API_URL = `https://${process.env.SHOPIFY_DOMAIN}/api/2024-04/graphql.json`;

    const query = `
    query getProducts($limit: Int!, $reverse: Boolean!){
      products(first: $limit, sortKey: BEST_SELLING,reverse: $reverse) {
        edges {
          node {
            id
            title
            handle
            totalInventory
            variants(first: 1) {
              edges {
                 node {
                   price {
                     amount
                     currencyCode
                   }
                }
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                }
              }
            }
          }
        }
      }
    }`;

    // 2. get values from database
    const settings = await db.settings.findFirst();

    const variables = {
        limit: settings.productCount, // bunu dışarıdan alabilirsin
        reverse: settings.isReverse, // bunu dışarıdan alabilirsin};
    };

    // 1. Shopify’dan veri çek
    const shopifyResponse = await fetch(SHOPIFY_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!shopifyResponse.ok) {
        return json({ ok: false, message: "Shopify API failed" }, { status: 500 });
    }

    const result = await shopifyResponse.json();
    const products = result?.data?.products?.edges.map((edge) => edge.node) ?? [];

    

    // 3. Cevabı birleştir
    const response = json({
        ok: true,
        message: "Success",
        data: {
            settings:settings,
            products:products,
        },
    });

    return cors(request, response);
}

export async function action({ request }) {
    const method = request.method;
    switch (method) {
        case "POST":
            break;
        case "PATCH":
            break;
        default:
            return new Response("Method not allowed", { status: 405 });
    }
    return json({ message: "success" });
}