import Validator from 'validator';
import isEmpty from './isEmpty';

function validateRegisterForm(data) {
  let errors = {};


  data.username = !isEmpty(data.username) ? data.username : '';
  data.password = !isEmpty(data.password) ? data.password : '';

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.firstname = 'Name must be between 2 and 30 character long';
  }

  if (Validator.isEmpty(data.username)) {
    errors.username = 'username field is required';
  }

  if (!Validator.isLowercase(data.username)) {
    errors.username = 'username must be in lowecase';
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = 'password field is required';
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = 'password must be at least 6 characters long';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

export default validateRegisterForm;