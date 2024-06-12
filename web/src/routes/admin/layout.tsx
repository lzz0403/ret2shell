import SidebarLayout from "@blocks/sidebar-layout";
import { Title } from "@storage/header";
import { platformStore } from "@storage/platform";
import { t } from "@storage/theme";
import type { JSX } from "solid-js";
import SideBar from "./_blocks/sidebar";

export default function (props: { children?: JSX.Element }) {
    return (
        <>
            <Title title={`${t("admin.title")} - ${platformStore.config.name || t("platform.name")}`} />
            <SidebarLayout
                leftBar={
                    <>
                        <SideBar />
                    </>
                }
            >
                {props.children}
            </SidebarLayout>
        </>
    );
}
