interface Options {
  options: Record<string, string>;
  text: string;
}

export function parseOptions(input: string): Options {
  // Regular expression matches options in the form "~color:red",
  // "~bgColor:red"
  const pattern = /(?:~([a-z]+):([a-z\(\)0-9%,_"'#-]+))/siug;

  const options: Record<string, string> = {};

  let optionMatch: RegExpExecArray | null;
  let optionEnd = 0;

  // get the next occurrence of the pattern in the string
  while ((optionMatch = pattern.exec(input)) !== null) {
    // stores first capturing group as key
    const key = optionMatch[1].toLowerCase();
    // stores second capturing group as value
    const value = optionMatch[2];
    options[key] = value;

    // index where user text will begin
    optionEnd = optionMatch.index + optionMatch[0].length;
  }

  const text = input.slice(optionEnd);

  return {
    options,
    text,
  };
}
