"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
function generate() {
    const MaxLen = 8;
    let ans = "";
    const subset = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < MaxLen; i++) {
        ans += subset[Math.floor(Math.random() * subset.length)];
    }
    return ans;
}
exports.generate = generate;
