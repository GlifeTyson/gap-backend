import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import _ from "lodash";

export const createTokens = async ({ user, secret1 }) => {
  const createToken = jwt.sign(
    {
      user: _.pick(user, ["id", "username"]),
    },
    secret1,
    {
      expiresIn: "7d",
    }
  );

  return createToken;
};

// export const tryLogin = async (args, context) => {
//   const { username, password } = args || {};
//   const { mongo, SECRET1, SECRET2 } = context || {};

//   const user =
//     !!username &&
//     (await mongo.User.findOne({
//       $or: [{ username: username }, { email: username }],
//       deletedAt: null,
//     }));

//   if (!user) {
//     return {
//       success: false,
//       message: "Wrong username or password",
//     };
//   }
//   if (user.inactive) {
//     return {
//       success: false,
//       message: "User is no longer active",
//     };
//   }

//   const valid = await bcrypt.ccompareSync(password, user.password);
//   if (!valid) {
//     // bad password
//     return {
//       success: false,
//       message: "Wrong username or password",
//     };
//   }

//   const refreshTokenSecret = user.password + SECRET2;

//   const [token, refreshToken] = await createTokens({
//     user,
//     secret1: SECRET1,
//     secret2: refreshTokenSecret,
//   });

//   const updatedUser = await mongo.User.findOneAndUpdate(
//     { _id: ObjectId(user._id) },
//     {
//       $set: {
//         lastLoggedInAt: new Date().getTime(),
//       },
//     },
//     {
//       returnNewDocument: true,
//     }
//   );

//   return {
//     success: true,
//     user: updatedUser.value,
//     token,
//     refreshToken,
//   };
// };

export const hashPassword = (password) => {
  return bcrypt.hashSync(password, 12);
};
export const comparePassword = (password, hashPassword) => {
  return bcrypt.compareSync(password, hashPassword);
};
