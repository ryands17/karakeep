import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "jsx-email";

import serverConfig from "../../config";
import { InviteUserProps } from "../interface";

export const InviteUser = ({ email, inviterName, token }: InviteUserProps) => {
  const previewText = `Join ${inviterName} on Karakeep`;
  const inviteLink = `${serverConfig.publicUrl}/invite/${encodeURIComponent(token)}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-[40px] w-[465px] border-separate rounded border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Join <strong>{inviterName}</strong> on <strong>Karakeep</strong>
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              Hello {email},
            </Text>
            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                backgroundColor="#000000"
                width={120}
                height={38}
                borderRadius={4}
                textColor="#fff"
                align="center"
                href={inviteLink}
              >
                Join the app
              </Button>
            </Section>
            <Text className="!text-[14px] leading-[24px] text-black">
              or copy and paste this URL into your browser:{" "}
              <Link href={inviteLink} className="text-blue-600 no-underline">
                {inviteLink}
              </Link>
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="!text-[12px] leading-[24px] text-[#666666]">
              This invitation was intended for{" "}
              <span className="text-black">{email} </span>.This invite was sent
              from <span className="text-black">{inviterName}</span>. If you
              were not expecting this invitation, you can ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
