import { config } from "../../package.json";

class PDFAnnotationSharing {
  private apiUrl: string;

  constructor(private Zotero: _ZoteroTypes.Zotero) {
    this.apiUrl = "https://your-api-server.com/annotations"; // 替换为您的API服务器地址
  }

  public async getLocalAnnotations(item: Zotero.Item): Promise<Zotero.Annotation[]> {
    if (!item.isFileAttachment()) {
      throw new Error("项目不是文件附件");
    }

    try {
      const annotations = await this.Zotero.Annotations.getAnnotations(item.id);
      this.Zotero.debug(`${config.addonName}: 获取到 ${annotations.length} 个本地注释，项目ID: ${item.id}`);
      return annotations;
    } catch (error) {
      this.Zotero.debug(`${config.addonName}: 获取本地注释时出错: ${error.message}`);
      throw error;
    }
  }

  public async uploadAnnotations(item: Zotero.Item): Promise<void> {
    if (!item.isFileAttachment()) {
      throw new Error("项目不是文件附件");
    }

    try {
      const annotations = await this.getLocalAnnotations(item);
      const serializedAnnotations = annotations.map(ann => this.serializeAnnotation(ann));

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
        body: JSON.stringify({
          itemId: item.id,
          annotations: serializedAnnotations
        })
      });

      if (!response.ok) {
        throw new Error(`上传失败: ${response.statusText}`);
      }

      this.Zotero.debug(`${config.addonName}: 成功上传 ${annotations.length} 个注释到共享服务器`);
    } catch (error) {
      this.Zotero.debug(`${config.addonName}: 上传注释时出错: ${error.message}`);
      throw error;
    }
  }

  public async fetchCloudAnnotations(item: Zotero.Item): Promise<Zotero.Annotation[]> {
    if (!item.isFileAttachment()) {
      throw new Error("项目不是文件附件");
    }

    try {
      const response = await fetch(`${this.apiUrl}/${item.id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + this.getAuthToken()
        }
      });

      if (!response.ok) {
        throw new Error(`获取云端注释失败: ${response.statusText}`);
      }

      const cloudAnnotations = await response.json();
      this.Zotero.debug(`${config.addonName}: 成功从云端获取 ${cloudAnnotations.length} 个注释`);

      return cloudAnnotations.map(this.deserializeAnnotation.bind(this));
    } catch (error) {
      this.Zotero.debug(`${config.addonName}: 获取云端注释时出错: ${error.message}`);
      throw error;
    }
  }

  public async applyCloudAnnotations(item: Zotero.Item): Promise<void> {
    try {
      const cloudAnnotations = await this.fetchCloudAnnotations(item);
      
      for (const annotation of cloudAnnotations) {
        const existingAnnotation = await this.Zotero.Annotations.getAnnotationByKey(annotation.key);
        
        if (existingAnnotation) {
          Object.assign(existingAnnotation, annotation);
          await existingAnnotation.saveTx();
        } else {
          await this.Zotero.Annotations.saveAnnotation(item, annotation);
        }
      }

      this.Zotero.debug(`${config.addonName}: 成功应用 ${cloudAnnotations.length} 个云端注释`);
    } catch (error) {
      this.Zotero.debug(`${config.addonName}: 应用云端注释时出错: ${error.message}`);
      throw error;
    }
  }

  private serializeAnnotation(annotation: Zotero.Annotation): object {
    return {
      key: annotation.key,
      type: annotation.type,
      text: annotation.text,
      comment: annotation.comment,
      color: annotation.color,
      pageIndex: annotation.position.pageIndex,
      rects: annotation.position.rects,
      dateAdded: annotation.dateAdded.toISOString(),
      dateModified: annotation.dateModified.toISOString(),
      authorName: annotation.authorName,
      itemID: annotation.itemID,
      version: "1.0"
    };
  }

  private deserializeAnnotation(data: any): Zotero.Annotation {
    const annotation = new this.Zotero.Annotation();
    annotation.key = data.key;
    annotation.type = data.type;
    annotation.text = data.text;
    annotation.comment = data.comment;
    annotation.color = data.color;
    annotation.position = { pageIndex: data.pageIndex, rects: data.rects };
    annotation.dateAdded = new Date(data.dateAdded);
    annotation.dateModified = new Date(data.dateModified);
    annotation.authorName = data.authorName;
    annotation.itemID = data.itemID;
    return annotation;
  }

  private getAuthToken(): string {
    // 实现获取认证令牌的逻辑
    return "your-auth-token";
  }
}

export default PDFAnnotationSharing;
