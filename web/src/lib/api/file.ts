import { accountStore } from "@storage/account";
import type { DownloadProgress } from "ky";
import api from ".";

export async function downloadFile(
  url: string,
  searchParams?: { [key: string]: string },
  onDownloadProgress?: (progress: DownloadProgress) => void
) {
  return await api
    .get(url, {
      searchParams,
      onDownloadProgress,
    })
    .blob();
}

export async function uploadFile(
  url: string,
  name: string,
  file: File,
  onUploadProgress?: (progress: DownloadProgress) => void
) {
  const formData = new FormData();
  formData.append(name, file);
  const xhr = new XMLHttpRequest();
  const resp = await new Promise((resolve: (_: object) => void, reject: (_: string) => void) => {
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onUploadProgress?.({
          percent: (e.loaded / e.total) * 100,
          transferredBytes: e.loaded,
          totalBytes: e.total,
        });
      }
    });
    xhr.addEventListener("loadend", () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(xhr.responseText);
      }
    });
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    const token = accountStore.token;
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    xhr.send(formData);
  });
  return resp;
}
