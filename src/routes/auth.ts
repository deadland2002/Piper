/**
 * Authentication routes
 * POST /auth/login - Login user
 * POST /auth/logout - Logout user
 * Note: User registration is done during setup via /setup/create-admin
 */

import { Hono } from "hono";
import { login, logout } from "../handlers/auth/index.ts";

const authRoutes = new Hono();

authRoutes.post("/login", login);
authRoutes.post("/logout", logout);

export default authRoutes;
