export interface InviteUserProps {
  email: string;
  inviterName: string;
  token: string;
}

export interface ResetPasswordProps {
  name: string;
  email: string;
  url: string;
}

export interface EmailProvider {
  sendInviteEmail: (props: InviteUserProps) => Promise<void>;
  sendResetPasswordEmail: (props: ResetPasswordProps) => Promise<void>;
}
