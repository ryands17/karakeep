import * as React from "react";
import { render } from "jsx-email";
import { Resend } from "resend";
import invariant from "tiny-invariant";

import serverConfig from "../config";
import {
  EmailProvider,
  InviteUserProps,
  ResetPasswordProps,
} from "./interface";
import { InviteUser } from "./templates/InviteUser";
import { ResetPassword } from "./templates/ResetPassword";

export class ResendClient implements EmailProvider {
  private resend: Resend;

  private fromEmail: string;

  constructor() {
    invariant(
      serverConfig.email.resendApiKey !== undefined,
      "resend api key should be defined",
    );
    invariant(
      serverConfig.email.resendFromEmail !== undefined,
      "resend from email should be defined",
    );

    this.resend = new Resend(serverConfig.email.resendApiKey);
    this.fromEmail = serverConfig.email.resendFromEmail;
  }

  async sendInviteEmail(props: InviteUserProps) {
    const template = <InviteUser {...props} />;
    const subject = "You've been invited to join Karakeep";
    const html = await render(template);

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      subject,
      to: props.email,
      html,
    });

    if (error) {
      console.error("failed to send email", error.message);
      throw new Error(error.message);
    }
  }

  async sendResetPasswordEmail(props: ResetPasswordProps) {
    const template = <ResetPassword {...props} />;
    const subject = "Reset your password";
    const html = await render(template);

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      subject,
      to: props.email,
      html,
    });

    if (error) {
      console.error("failed to send email", { error });
      throw new Error(error.message);
    }
  }
}
