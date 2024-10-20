import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { getPref } from "../utils/prefs";
import { shareAnnotations, syncAnnotations } from "../utils/annotations";

export function registerMenu() {
  const menuIcon = `chrome://${config.addonRef}/content/icons/favicon.png`;
  
  // 添加分隔符
  ztoolkit.Menu.register("item", {
    tag: "menuseparator",
  });

  // 注册共享注释菜单项
  if (getPref("showItemMenuShareAnnotation")) {
    ztoolkit.Menu.register("item", {
      tag: "menuitem",
      label: getString("itemmenu-shareAnnotations-label"),
      commandListener: (ev) => {
        const zoteroPane = Zotero.getActiveZoteroPane();
        const selectedItems = zoteroPane.getSelectedItems();
        if (selectedItems.length > 0) {
          shareAnnotations(selectedItems.map(item => item.id));
        } else {
          ztoolkit.showErrorMessage(getString("error-noItemSelected"));
        }
      },
      icon: menuIcon,
    });
  }

  // 注册同步注释菜单项
  if (getPref("showItemMenuSyncAnnotations")) {
    ztoolkit.Menu.register("item", {
      tag: "menuitem",
      label: getString("itemmenu-syncAnnotations-label"),
      commandListener: (ev) => {
        const zoteroPane = Zotero.getActiveZoteroPane();
        const selectedItems = zoteroPane.getSelectedItems();
        if (selectedItems.length > 0) {
          syncAnnotations(selectedItems.map(item => item.id));
        } else {
          ztoolkit.showErrorMessage(getString("error-noItemSelected"));
        }
      },
      icon: menuIcon,
    });
  }
}
