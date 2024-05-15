import validate from "validate.js";

export function validatePostInput(args) {
  const constraints = {
    title: {
      presence: true,
      length: {
        minimum: 6,
        maximum: 100,
      },
    },
    content: {
      presence: true,
      length: {
        minimum: 6,
        maximum: 1000,
      },
    },
    slug: {
      presence: false,
    },
  };

  // Thực hiện validation sử dụng validate.js
  const validationErrors = validate(args, constraints);
  return validationErrors;
}
