import { clearPref, getPref, getPrefJSON, setPref } from "../utils/prefs";


export function setDefaultPrefSettings() {
  const isZhCN = Zotero.locale === "zh-CN";

  // 设置默认的注释共享服务器
  if (!getPref("annotationServer")) {
    setPref("annotationServer", "https://default-annotation-server.com");
  }

  // 设置默认的注释同步频率（以分钟为单位）
  if (!getPref("syncInterval")) {
    setPref("syncInterval", 30);
  }

  // 设置默认的注释可见性
  if (!getPref("annotationVisibility")) {
    setPref("annotationVisibility", "private");
  }

  // 设置默认的注释高亮颜色
  if (!getPref("highlightColor")) {
    setPref("highlightColor", "#FFFF00");
  }

  if (!getPref("targetLanguage")) {
    setPref("targetLanguage", Zotero.locale);
  }
}

