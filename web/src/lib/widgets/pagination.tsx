import { Pagination, type PaginationRootProps } from "@ark-ui/solid";
import { For } from "solid-js";

export default function (props: PaginationRootProps) {
  return (
    <Pagination.Root {...props} class={`flex flex-row space-x-2 items-center justify-center ${props.class}`.trim()}>
      <Pagination.Context>
        {(api) => (
          <For each={api().pages}>
            {(page, index) =>
              page.type === "page" ? (
                <Pagination.Item
                  {...page}
                  class={`btn btn-square btn-sm lg:btn-md justify-center ${
                    page.value === api().page ? "btn-primary" : ""
                  }`.trim()}
                >
                  {page.value}
                </Pagination.Item>
              ) : (
                <Pagination.Ellipsis index={index()}>&#8230;</Pagination.Ellipsis>
              )
            }
          </For>
        )}
      </Pagination.Context>
    </Pagination.Root>
  );
}
