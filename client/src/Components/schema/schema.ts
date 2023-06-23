import * as yup from 'yup';

export const schema = yup.object().shape({
    username: yup.string().required(),
    email: yup.string().email(),
    password: yup
      .string()
      .required('Password is required')
      .min(8, 'Password is too short - should be 8 chars minimum.')
      .matches(/[a-zA-Z]/, 'Password can only contain Latin letters.')
      .notOneOf(
        [yup.ref('username'), null],
        "Password can't be the same as the username"
      )
      .notOneOf([yup.ref('email'), null], "Password can't be the same as the email"),
    confirmPassword: yup
      .string()
      .required('Please re-type your password')
      .oneOf([yup.ref('password')], 'Passwords do not match'),
  });