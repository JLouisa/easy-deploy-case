import path from "path";

export function generate() {
  const MaxLen = 8;
  let ans = "";
  const subset = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < MaxLen; i++) {
    ans += subset[Math.floor(Math.random() * subset.length)];
  }
  return ans;
}

export function getOutputDir() {
  // Get the current directory
  const currentFolder = __dirname;

  // Get the parent directory of the current directory
  const parentFolder = path.dirname(currentFolder).concat(`/output`);

  return parentFolder;
}
