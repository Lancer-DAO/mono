import { createTRPCRouter } from "../../trpc";

import { login } from "./login";
import {currentUser} from "./currentUser"

export const users = createTRPCRouter({
  login,
currentUser
});
