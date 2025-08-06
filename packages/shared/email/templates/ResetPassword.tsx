import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "jsx-email";

import { ResetPasswordProps } from "../interface";

const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  padding: "45px",
};

const text = {
  fontSize: "16px",
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: "300",
  color: "#404040",
  lineHeight: "26px",
};

export const ResetPassword = (props: ResetPasswordProps) => {
  return (
    <Html>
      <Head />
      <Preview>Karakeep: Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={text}>Hi {props.name},</Text>
            <Text style={text}>
              You recently requested a password change for your Karakeep
              account. If this was you, you can set a new password here:
            </Text>
            <Button
              backgroundColor="#007ee6"
              borderRadius={4}
              textColor="#fff"
              fontSize={15}
              width={210}
              height={42}
              href={props.url}
            >
              Reset password
            </Button>
            <Text style={text}>
              If you don&apos;t want to change your password or didn&apos;t
              request this, just ignore and delete this message.
            </Text>
            <Text style={text}>
              To keep your account secure, please don&apos;t forward this email
              to anyone.{" "}
            </Text>
            <Text style={text}>Happy bookmarking!</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
