import validate from "validate.js";

export function validateUserInput(args) {
  const constraints = {
    email: {
      presence: false,
      email: true,
    },
    username: {
      presence: true,
      length: {
        minimum: 6,
        maximum: 20,
      },
    },
    fullName: {
      presence: false, // Optional field
      length: {
        maximum: 50,
      },
    },
    password: {
      presence: true,
      length: {
        minimum: 6,
        tooShort: "Password must be at least 6 characters long",
      },
    },
    avatarUrl: {
      presence: false, // Optional field
      url: true,
    },
  };

  // Thực hiện validation sử dụng validate.js
  const validationErrors = validate(args, constraints);
  return validationErrors;
}
