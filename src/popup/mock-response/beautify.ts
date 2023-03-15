import {
  css as cssBeautify,
  html as htmlBeautify,
  js as jsBeautify
} from 'js-beautify';

export interface BeautifyResult {
  hasError: boolean
  result: string
}

export function beautifyJSON (jsonString: string): BeautifyResult {
  try {
    const o = JSON.parse(jsonString);
    return { hasError: false, result: JSON.stringify(o, null, '  ') };
  } catch (e) {
    return { hasError: true, result: jsonString };
  }
}

export function beautifyJS (jsString: string, options = { indent_size: 2, space_in_empty_paren: true } as object): BeautifyResult {
  try {
    const result = jsBeautify(jsString, options);
    return { hasError: false, result };
  } catch (e) {
    return { hasError: true, result: jsString };
  }
}

export function beautifyCSS (cssString: string, options = { indent_size: 2, space_around_combinator: true, space_in_empty_paren: true } as object): BeautifyResult {
  try {
    const result = cssBeautify(cssString, options);
    return { hasError: false, result };
  } catch (e) {
    return { hasError: true, result: cssString };
  }
}

export function beautifyXML (xmlString: string, options = { indent_size: 2, space_in_empty_paren: true } as object): BeautifyResult {
  try {
    const result = htmlBeautify(xmlString, options);
    return { hasError: false, result };
  } catch (e) {
    return { hasError: true, result: xmlString };
  }
}
