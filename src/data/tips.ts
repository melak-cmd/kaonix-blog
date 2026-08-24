export interface Tip {
  icon: string;
  title: string;
  text: string;
  tag: string;
}

export const TIPS: Tip[] = [
  {
    icon: "🔍",
    title: "Read errors bottom-up",
    text: "Stack traces tell the real cause at the end. Start from the last line of your own code, not the first line of the error.",
    tag: "debugging",
  },
  {
    icon: "⌨️",
    title: "Learn your editor's shortcuts",
    text: "Ten minutes learning multi-cursor editing and jump-to-definition saves hours every week. Speed compounds.",
    tag: "productivity",
  },
  {
    icon: "🔒",
    title: "Rotate secrets, don't delete them",
    text: "A leaked API key in Git history is compromised forever, even after removal. Rotating credentials is the only real fix.",
    tag: "security",
  },
  {
    icon: "📦",
    title: "Pin your dependencies",
    text: "Use exact versions plus a lockfile in CI. 'It works on my machine' usually means someone has a different semver.",
    tag: "devops",
  },
  {
    icon: "🧪",
    title: "Test the boundary, not the happy path",
    text: "Empty input, zero, null, huge numbers, unicode. Bugs live at the edges — write one edge-case test before shipping.",
    tag: "testing",
  },
  {
    icon: "🌿",
    title: "Commit small, push often",
    text: "Atomic commits make reviews fast and bisecting possible. If you can't write a clear message, the commit is too big.",
    tag: "git",
  },
  {
    icon: "🐳",
    title: "One process per container",
    text: "Containers that do one thing restart cleanly, scale horizontally, and debug predictably. Resist the kitchen sink.",
    tag: "docker",
  },
  {
    icon: "📖",
    title: "Rubber-duck before you search",
    text: "Explaining the bug out loud forces your brain to question assumptions. Half of bugs dissolve before Stack Overflow loads.",
    tag: "debugging",
  },
  {
    icon: "⚡",
    title: "Measure before optimizing",
    text: "Intuition about performance is wrong more often than right. Profile first, then fix what the numbers point to.",
    tag: "performance",
  },
];

/** Deterministic "tip of the day" — changes daily */
export function getTipOfTheDay(date = new Date()): Tip {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  return TIPS[dayOfYear % TIPS.length];
}
