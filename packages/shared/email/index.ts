import invariant from "tiny-invariant";

import serverConfig from "../config";
import { EmailProvider } from "./interface";
import { ResendClient } from "./resend";

class EmailClient {
  constructor(public provider: EmailProvider) {
    invariant(serverConfig.email.enabled);
  }
}

export const emailClient = new EmailClient(new ResendClient());
