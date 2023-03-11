export default function isValidJson (obj: unknown) {
  // check "obj" for string
  if (typeof obj === 'string') {
    // obj is string, parse it using JSON.parse()
    try {
      const isJSON = JSON.parse(obj);
      // this is for null, as "null" is a valid JSON and type of null is object
      // but "null" is itself falsey
      // if isJSON is null then if( isJSON && ... ) will be false
      if (isJSON && typeof isJSON === 'object') {
        // everything goes fine, return true
        return true;
      }

      return false;
    } catch (e) {
      // cannot parse, invalid JSON
      return false;
    }
  }
  // "obj" is not string, so first,
  // JSON.stringify() it, then parse
  const jsonString = JSON.stringify(obj);
  // now parse this json string
  try {
    const checkJSON = JSON.parse( jsonString );
    // this is for null, as "null" is a valid JSON and type of null is object
    // but "null" is itself falsey
    // if isJSON is null then if( isJSON && ... ) will be false
    if (checkJSON && typeof checkJSON === 'object') {
      // everything goes fine, return true
      return true;
    }

    return false;
  } catch (e) {
    // cannot parse, invalid JSON
    return false;
  }
}
