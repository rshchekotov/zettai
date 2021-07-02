export const GENERIC_ERROR = 'Something went wrong. Please contact the developer!';

export function popWord(text: string) {
  const tokens = text.split(/[ \r\n\t]+/).filter(e => e.length > 0);
  const token = tokens.length > 0 ? tokens[0] : '';
  return [token, text.substr(token.length).replace(/^[ \n]+/, '')];
}

export async function computeBounds(start: number, step: number, func: (param: number, dry: boolean) => Promise<any>) {
  let exists: boolean = false;
  let prev: boolean = false;

  while(exists === !prev && step === 1) {
    let res = await func(start, true);  
    prev = exists;
    if(res) start += step;
    else {
      start -= step;
      step = Math.ceil(step/2.0);
    }
    exists = !(!res);
  }
  return exists ? start : start-1;
}