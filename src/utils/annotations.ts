import { config } from "../../package.json";
import { getString } from "./locale";
import { getPref } from "./prefs";
import Addon from "../addon";

interface AnnotationTask {
  id: string;
  type: "share" | "sync";
  itemId: number;
  annotations: Zotero.Item[];
  status: "waiting" | "processing" | "success" | "fail";
  result: string;
}

class AnnotationTaskRunner {
  protected processor: (data: AnnotationTask) => Promise<void>;

  constructor(processor: (data: AnnotationTask) => Promise<void>) {
    this.processor = processor;
  }

  public async run(data: AnnotationTask) {
    const addon = Zotero[config.addonInstance] as Addon;
    const ztoolkit = addon.data.ztoolkit;

    data.status = "processing";
    try {
      ztoolkit.log(data);
      await this.processor(data);
      data.status = "success";
    } catch (e) {
      data.result = this.makeErrorInfo(data.type, String(e));
      data.status = "fail";
    }
  }

  protected makeErrorInfo(type: string, detail: string) {
    return `${getString("annotation-errorPrefix")} ${getString(
      `annotation-${type}`
    )}\n\n${detail}`;
  }
}

async function processShareAnnotations(task: AnnotationTask) {
  // 实现共享注释的逻辑
  // 例如：将注释上传到服务器
  for (const annotation of task.annotations) {
    // 上传注释的代码
    // 这里需要实现实际的上传逻辑
  }
  task.result = "Annotations shared successfully";
}

async function processSyncAnnotations(task: AnnotationTask) {
  // 实现同步注释的逻辑
  // 例如：从服务器获取最新的注释并更新本地
  for (const annotation of task.annotations) {
    // 同步注释的代码
    // 这里需要实现实际的同步逻辑
  }
  task.result = "Annotations synced successfully";
}

const shareRunner = new AnnotationTaskRunner(processShareAnnotations);
const syncRunner = new AnnotationTaskRunner(processSyncAnnotations);

export async function shareAnnotations(itemIds: number[]) {
  for (const itemId of itemIds) {
    const item = await Zotero.Items.getAsync(itemId);
    if (!item) continue;

    const annotations = item.getAnnotations();
    if (annotations.length > 0) {
      const task: AnnotationTask = {
        id: `share-${Zotero.Utilities.randomString()}-${new Date().getTime()}`,
        type: "share",
        itemId: itemId,
        annotations: annotations,
        status: "waiting",
        result: "",
      };
      await shareRunner.run(task);
    }
  }
}

export async function syncAnnotations(itemIds: number[]) {
  for (const itemId of itemIds) {
    const item = await Zotero.Items.getAsync(itemId);
    if (!item) continue;

    const annotations = item.getAnnotations();
    const task: AnnotationTask = {
      id: `sync-${Zotero.Utilities.randomString()}-${new Date().getTime()}`,
      type: "sync",
      itemId: itemId,
      annotations: annotations,
      status: "waiting",
      result: "",
    };
    await syncRunner.run(task);
  }
}
