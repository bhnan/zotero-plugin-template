import { BasicTool } from "zotero-plugin-toolkit";
import Addon from "./addon";
import { config } from "../package.json";
import { getString, initLocale } from "./utils/locale";
import PDFAnnotationSharing from "./modules/pdfAnnotationSharing";

const basicTool = new BasicTool();

if (!basicTool.getGlobal("Zotero")[config.addonInstance]) {
  _globalThis.addon = new Addon();
  defineGlobal("ztoolkit", () => {
    return _globalThis.addon.data.ztoolkit;
  });
  Zotero[config.addonInstance] = addon;
}

function defineGlobal(name: Parameters<BasicTool["getGlobal"]>[0]): void;
function defineGlobal(name: string, getter: () => any): void;
function defineGlobal(name: string, getter?: () => any) {
  Object.defineProperty(_globalThis, name, {
    get() {
      return getter ? getter() : basicTool.getGlobal(name);
    },
  });
}

class Addon {
  private pdfAnnotationSharing: PDFAnnotationSharing;

  constructor(public Zotero: _ZoteroTypes.Zotero) {
    this.pdfAnnotationSharing = new PDFAnnotationSharing(Zotero);
  }

  public async init() {
    await initLocale();
    await this.pdfAnnotationSharing.init();

    Zotero.debug(`${config.addonName}: Init complete`);
  }

  // 其他必要的方法...
}

export default Addon;
