import Terminal from "@lib/shell/terminal";
import type { Challenge } from "@models/challenge";

export default function (props: { challenge?: Challenge }) {
  return <Terminal challenge={props.challenge} />;
}
