import { Clipboard, type ClipboardRootProps } from "@ark-ui/solid";
import { t } from "@storage/theme";
import { Show, splitProps } from "solid-js";

export default function ClipboardBtn(
  props: ClipboardRootProps & {
    size?: "sm" | "md";
    square?: boolean;
    icon?: string;
    label?: string;
  }
) {
  const [btnProps, others] = splitProps(props, ["size", "square", "icon", "label"]);
  return (
    <Clipboard.Root {...others}>
      <Clipboard.Control class="w-full flex flex-row space-x-2">
        <Clipboard.Input hidden class="hidden" />
        {/* btn-sm btn-md */}
        <Clipboard.Trigger
          class={`btn btn-${btnProps.size || "md"} flex items-center space-x-2 justify-center ${btnProps.square ? "btn-square" : ""}`.trim()}
          title={others.title ?? t("form.copy")}
        >
          <Clipboard.Indicator
            class="flex items-center justify-center"
            copied={<span class="icon-[fluent--checkmark-20-regular] w-5 h-5 text-success" />}
          >
            <span class={btnProps.icon ?? "icon-[fluent--copy-20-regular] w-5 h-5"} />
          </Clipboard.Indicator>
          <Show when={btnProps.label}>
            <span>{btnProps.label}</span>
          </Show>
        </Clipboard.Trigger>
      </Clipboard.Control>
    </Clipboard.Root>
  );
}
