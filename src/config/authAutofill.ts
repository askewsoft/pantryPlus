import type React from 'react';
import { Authenticator } from '@aws-amplify/ui-react-native';

import { createAuthFormFields } from '@/components/auth/createAuthFormFields';
import type { PasswordAutofillKind } from '@/components/auth/authFieldAutofill';

// Amplify exposes FormFields as static slots without public prop types for autofill.
type AuthenticatorScreen = {
  FormFields: React.ComponentType<Record<string, unknown>>;
};

const defaultTextFormFields = (Authenticator.SignIn as AuthenticatorScreen).FormFields;

function assignAuthFormFields(screen: AuthenticatorScreen, passwordKind: PasswordAutofillKind) {
  screen.FormFields = createAuthFormFields(
    defaultTextFormFields as React.ComponentType<{ fields?: Array<{ name: string; type?: string }> }>,
    passwordKind
  ) as AuthenticatorScreen['FormFields'];
}

export function configureAuthenticatorAutofill() {
  assignAuthFormFields(Authenticator.SignIn as AuthenticatorScreen, 'current');
  assignAuthFormFields(Authenticator.ForgotPassword as AuthenticatorScreen, 'current');
  assignAuthFormFields(Authenticator.SignUp as AuthenticatorScreen, 'new');
  assignAuthFormFields(Authenticator.ForceNewPassword as AuthenticatorScreen, 'new');
  assignAuthFormFields(Authenticator.ConfirmResetPassword as AuthenticatorScreen, 'new');
  assignAuthFormFields(Authenticator.ConfirmSignIn as AuthenticatorScreen, 'current');
  assignAuthFormFields(Authenticator.ConfirmSignUp as AuthenticatorScreen, 'current');
  assignAuthFormFields(Authenticator.SetupEmail as AuthenticatorScreen, 'current');
  assignAuthFormFields(Authenticator.SetupTotp as AuthenticatorScreen, 'current');
  assignAuthFormFields(Authenticator.ConfirmVerifyUser as AuthenticatorScreen, 'current');
}
