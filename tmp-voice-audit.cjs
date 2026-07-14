var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/data/bundledVoiceMap.js
var bundledVoiceMap_exports = {};
__export(bundledVoiceMap_exports, {
  BUNDLED_VOICE_BY_ID: () => BUNDLED_VOICE_BY_ID,
  resolveBundledVoiceUrl: () => resolveBundledVoiceUrl
});
module.exports = __toCommonJS(bundledVoiceMap_exports);
var BASE = "/voice/sangrepreciosa";
var BUNDLED_VOICE_BY_ID = {
  PBO_1: `${BASE}/PBO_1.wav`,
  PBO_2: `${BASE}/PBO_2.wav`,
  PBO_3: `${BASE}/PBO_3.wav`,
  PBO_4: `${BASE}/PBO_4.wav`,
  PBO_5: `${BASE}/PBO_5.wav`,
  PBO_6: `${BASE}/PBO_6.wav`,
  PBO_7: `${BASE}/PBO_7.wav`,
  PBContrition: `${BASE}/PBContrition.wav`,
  PB: `${BASE}/PB.wav`,
  PB_P: `${BASE}/PB_P.wav`,
  PB_G: `${BASE}/PB_G.wav`,
  PBClosing: `${BASE}/PBClosing.wav`,
  LPB_Close: `${BASE}/LPB_Close.wav`,
  LPB_1: `${BASE}/LPB_1.wav`,
  LPB_2: `${BASE}/LPB_2.wav`,
  LPB_3: `${BASE}/LPB_3.wav`,
  LPB_4: `${BASE}/LPB_4.wav`,
  LPB_5: `${BASE}/LPB_5.wav`,
  LPB_6: `${BASE}/LPB_6.wav`,
  LPB_7: `${BASE}/LPB_7.wav`,
  LPB_8: `${BASE}/LPB_8.wav`,
  LPB_9: `${BASE}/LPB_9.wav`,
  SC: `${BASE}/SC.wav`
};
function resolveBundledVoiceUrl(prayerId) {
  if (!prayerId || typeof prayerId !== "string") return null;
  if (BUNDLED_VOICE_BY_ID[prayerId]) return BUNDLED_VOICE_BY_ID[prayerId];
  const m = prayerId.match(/^(.*)_\d+$/);
  if (m && BUNDLED_VOICE_BY_ID[m[1]]) return BUNDLED_VOICE_BY_ID[m[1]];
  return null;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BUNDLED_VOICE_BY_ID,
  resolveBundledVoiceUrl
});
