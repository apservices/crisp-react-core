export interface TimedComment {
  time: number; // em segundos
  text: string;
}

export function parseComments(comments: string): TimedComment[] {
  return comments
    .split("\\n")
    .map((line) => {
      const match = line.match(/^\\[(\\d{1,4}(\\.\\d{1,2})?)\\]\\s*\\-\\s*(.+)$/);
      if (!match) return null;
      return {
        time: parseFloat(match[1]),
        text: match[3].trim(),
      };
    })
    .filter((c): c is TimedComment => !!c)
    .sort((a, b) => a.time - b.time);
}
