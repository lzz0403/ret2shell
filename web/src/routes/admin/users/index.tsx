import type { User } from "@models/user";
import { Title } from "@storage/header";
import { platformStore } from "@storage/platform";
import { t } from "@storage/theme";
import { createSignal } from "solid-js";

export default function () {
  const [users, setUsers] = createSignal([] as User[]);
  const [page, setPage] = createSignal(1);
  const pageSize = 15;
  const [loading, setLoading] = createSignal(true);
  const [total, setTotal] = createSignal(0);
  const [filter, setFilter] = createSignal("");
  const [order, setOrder] = createSignal("id" as "id" | "account" | "institute_id" | "registered_at");
  const [instituteId, setInstituteId] = createSignal(null as number | null);
  return (
    <>
      <Title title={`${t("admin.users.title")} - ${platformStore.config.name || t("platform.name")}`} />
    </>
  );
}
