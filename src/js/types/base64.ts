/**
 *  base64.ts
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 *
 * @author Dan Kogai (https://github.com/dankogai)
 */
declare const version = "3.6.0";
/**
 * @deprecated use lowercase `version`.
 */
declare const VERSION = "3.6.0";

declare const Base64: {
  version: string;
  VERSION: string;
  atob: (asc: string) => string;
  atobPolyfill: (asc: string) => string;
  btoa: (bin: string) => string;
  btoaPolyfill: (bin: string) => string;
  fromBase64: (src: string) => string;
  toBase64: (src: string, urlsafe?: boolean) => string;
  encode: (src: string, urlsafe?: boolean) => string;
  encodeURI: (src: string) => string;
  encodeURL: (src: string) => string;
  utob: (u: string) => string;
  btou: (b: string) => string;
  decode: (src: string) => string;
  isValid: (src: any) => boolean;
  fromUint8Array: (u8a: Uint8Array, urlsafe?: boolean) => string;
  toUint8Array: (a: string) => Uint8Array;
  extendString: () => void;
  extendUint8Array: () => void;
  extendBuiltins: () => void;
};