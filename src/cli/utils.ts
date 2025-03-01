import { createInterface } from "readline";
import { Colors } from "../common";

export function input(question: string): Promise<string> {
  return new Promise((resolve) => {
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question(
      `${Colors.FgGreen}?${Colors.Reset} ${question} ${Colors.FgCyan}`,
      (result) => {
        readline.close();
        process.stdout.write(Colors.Reset);
        resolve(result);
      }
    );
  });
}

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export function hideCursor() {
  process.stdout.write("\u001B[?25l");
}

export function showCursor() {
  process.stdout.write("\u001B[?25h");
}

export function spinner(
  message: string = ""
): (success: boolean, updatedMessage?: string) => void {
  let keepSpinning = true;
  let frame = 0;
  const spin = () => {
    if (!keepSpinning) return;

    process.stdout.clearLine(-1);
    process.stdout.cursorTo(0);
    process.stdout.write(
      `${Colors.FgCyan}${FRAMES[frame]}${Colors.Reset} ${message}`
    );
    frame = (frame + 1) % FRAMES.length;

    setTimeout(spin, 100);
  };

  hideCursor();
  spin();
  return (success: boolean, updatedMessage) => {
    keepSpinning = false;
    process.stdout.clearLine(-1);
    process.stdout.cursorTo(0);
    showCursor();
    process.stdout.write(
      `${success ? `${Colors.FgGreen}✔` : `${Colors.FgRed}✖️`}${
        Colors.Reset
      } ${message} ${updatedMessage}\n`
    );
  };
}

export function log(text: string) {
  console.log(`  ${text}`);
}

export function bullet(text: string) {
  console.log(`  • ${text}`);
}
