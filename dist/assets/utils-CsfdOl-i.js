const a = (e = 0) => new Promise((t) => setTimeout(t, e)),
  o = {
    email: (e) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ||
      "Please enter a valid email address",
    username: (e) => /^admin$/.test(e) || "请输入有效用户名",
    required: (e) => !!e || "This field is required",
  },
  i = (e = 32) => {
    const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let r = "";
    for (let s = 0; s < e; s++) {
      const n = Math.floor(Math.random() * t.length);
      r += t[n];
    }
    return r;
  };
export { i as g, a as s, o as v };
//# sourceMappingURL=utils-CsfdOl-i.js.map
