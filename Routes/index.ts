import { Hono } from 'hono'
import UserRoutes from "./User/index.ts";

const app = new Hono()

app.route('/user', UserRoutes)

export default app