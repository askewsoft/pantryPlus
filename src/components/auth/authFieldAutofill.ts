import type { TextInputProps } from 'react-native';

type AuthField = {
  name?: string;
  type?: string;
};

export type PasswordAutofillKind = 'current' | 'new';

const PASSWORD_RULES =
  'minlength: 8; required: lower; required: upper; required: digit; required: special;';

const isUsernameField = ({ name, type }: AuthField) =>
  type === 'email' || name === 'username' || name === 'email';

const isPasswordField = ({ type }: AuthField) => type === 'password';

const isOneTimeCodeField = ({ name }: AuthField) => name === 'confirmation_code';

export function getAuthFieldAutofillProps(
  field: AuthField,
  passwordKind: PasswordAutofillKind
): Pick<TextInputProps, 'textContentType' | 'autoComplete' | 'passwordRules' | 'importantForAutofill'> {
  if (isOneTimeCodeField(field)) {
    return {
      textContentType: 'oneTimeCode',
      autoComplete: 'sms-otp',
      importantForAutofill: 'yes',
    };
  }

  if (isUsernameField(field)) {
    return {
      textContentType: 'username',
      autoComplete: 'username',
      importantForAutofill: 'yes',
    };
  }

  if (isPasswordField(field)) {
    if (passwordKind === 'new' || field.name === 'confirm_password') {
      return {
        textContentType: 'newPassword',
        autoComplete: 'password-new',
        passwordRules: PASSWORD_RULES,
        importantForAutofill: 'yes',
      };
    }

    return {
      textContentType: 'password',
      autoComplete: 'password',
      importantForAutofill: 'yes',
    };
  }

  return { importantForAutofill: 'yes' };
}
