import { Hono } from 'hono'
import { createUser } from "./controller.ts";
const app = new Hono()

app.get('/create',createUser)

export default app