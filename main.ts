import { Hono } from 'hono'
import Routes from "./Routes/index.ts";

const app = new Hono()

app.route('/', Routes)

Deno.serve(app.fetch)