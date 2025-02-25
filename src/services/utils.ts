export const sleep = (ms = 0) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/** Validation */
export const validators = {
  email: (v: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(v) || "Please enter a valid email address";
  },
  username: (v: string) => {
    const pattern = /^admin|umpool$/;
    return pattern.test(v) || "请输入有效用户名";
  },
  required: (v: any) => !!v || "This field is required",
};

export const generateToken = (length = 32) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters[randomIndex];
  }
  return token;
};
