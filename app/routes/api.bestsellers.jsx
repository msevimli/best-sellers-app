import { json } from "@remix-run/node";
import db from "../db.server";
import { cors } from "remix-utils/cors";

export async function loader({request}) {
    
    // get data from database
    const settings = await db.settings.findFirst();
    //return json(settings);
    const response = json({
        ok: true,
        message: "Success",
        data: settings,
      });
    
      return cors(request, response);
}

export async function action({request}) {
    const method = request.method;
    switch (method) {
        case "POST":
            break;
        case "PATCH":
            break;
        default:
            return new Response("Method not allowed", {status: 405});        
    }
    return json({message:"success"});
}