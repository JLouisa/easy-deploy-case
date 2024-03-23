export function generate() {
  const MaxLen = 8;
  let ans = "";
  const subset = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < MaxLen; i++) {
    ans += subset[Math.floor(Math.random() * subset.length)];
  }
  return ans;
}
