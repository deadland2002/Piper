/**
 * Page routes for Piper
 * Handles GET requests for different pages
 */

import { Hono } from "hono";
import { renderHomePage } from "../templates/pages/Home.ts";
import { renderLoginPage } from "../templates/pages/Login.ts";
import { renderSetupPage } from "../templates/pages/Setup.ts";
import { renderPipelinesPage } from "../templates/pages/Pipelines.ts";
import { renderTeamsPage } from "../templates/pages/Teams.ts";
import { renderRunnersPage } from "../templates/pages/Runners.ts";
import { renderUsersPage } from "../templates/pages/Users.ts";
import { TeamService } from "../database/team-service.ts";

const pagesRouter = new Hono();

/**
 * Home page route
 */
pagesRouter.get("/home", (c) => {
  return c.html(renderHomePage());
});

/**
 * Login page route
 */
pagesRouter.get("/login", (c) => {
  return c.html(renderLoginPage());
});

/**
 * Setup page route
 */
pagesRouter.get("/setup", (c) => {
  return c.html(renderSetupPage());
});

/**
 * Pipelines page route
 */
pagesRouter.get("/pipelines", (c) => {
  return c.html(renderPipelinesPage());
});

/**
 * Teams page route
 */
pagesRouter.get("/teams", (c) => {
  const teams = TeamService.listTeams();
  return c.html(renderTeamsPage(teams));
});

/**
 * Runners page route
 */
pagesRouter.get("/runners", (c) => {
  return c.html(renderRunnersPage());
});

/**
 * Users page route
 */
pagesRouter.get("/users", (c) => {
  return c.html(renderUsersPage());
});

export default pagesRouter;
