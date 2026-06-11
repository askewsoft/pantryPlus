import React from 'react';

import {
  getAuthFieldAutofillProps,
  type PasswordAutofillKind,
} from './authFieldAutofill';

type AuthFormField = {
  name: string;
  type?: string;
  [key: string]: unknown;
};

type TextFormFieldsProps = {
  fields?: AuthFormField[];
};

export function createAuthFormFields(
  DefaultTextFormFields: React.ComponentType<TextFormFieldsProps>,
  passwordKind: PasswordAutofillKind
) {
  function AuthFormFields(props: TextFormFieldsProps) {
    const fieldsWithAutofill = props.fields?.map((field) => ({
      ...field,
      ...getAuthFieldAutofillProps(field, passwordKind),
    }));

    return <DefaultTextFormFields {...props} fields={fieldsWithAutofill} />;
  }

  AuthFormFields.displayName = 'AuthFormFields';

  return AuthFormFields;
}
