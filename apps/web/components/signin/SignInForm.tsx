import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Info } from "lucide-react";

import serverConfig from "@karakeep/shared/config";

import CredentialsForm from "./CredentialsForm";

export default async function SignInForm() {
  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your Karakeep account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {serverConfig.demoMode && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold">Demo Mode</p>
                  <p>Email: {serverConfig.demoMode.email}</p>
                  <p>Password: {serverConfig.demoMode.password}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <CredentialsForm />
        </CardContent>
      </Card>
    </div>
  );
}
