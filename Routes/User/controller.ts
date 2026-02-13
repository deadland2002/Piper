import { Context } from "hono";

const createUser = (c : Context) => {
    return c.text('User created!')
}
export {createUser}