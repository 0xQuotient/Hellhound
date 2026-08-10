import {
  analyzeText,
  toEntry,
  ingestFiles as ingestStandardFiles,
} from "./hellhound-scoring";

const MBOX_DELIMITER = /^From \S+.*$/gm;
const DETECTION_BYTES = 1024 * 1024;

function isMboxSample(text) {
  const matches = text.match(MBOX_DELIMITER);
  return Boolean(matches && matches.length >= 2);
}

function scoreMessage(text, label, index) {
  return toEntry(
    analyzeText(text, {
      label,
      channel: "Email",
      outcome: "Unknown",
    }),
    index,
  );
}

async function ingestMbox(file, { onProgress, signal } = {}) {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let index = 0;
  let entries = [];

  const emitCompleteMessages = async (flush = false) => {
    const matches = [...buffer.matchAll(MBOX_DELIMITER)];
    if (!matches.length) return;

    // Keep the final delimiter and everything after it for the next chunk.
    const last = matches[matches.length - 1];
    const keepFrom = last.index;
    const complete = buffer.slice(0, keepFrom);
    buffer = buffer.slice(keepFrom);

    if (complete.trim()) {
      const parts = complete.split(/\r?\n(?=From \S+.*$)/m);
      for (const part of parts) {
        if (signal?.aborted) return;
        const text = part.trim();
        if (!text) continue;
        entries.push(scoreMessage(text, `${file.name} #${++index}`, index - 1));
        onProgress?.({ done: index, file: file.name });
        if (index % 100 === 0) await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    if (flush && buffer.trim()) {
      const text = buffer.trim();
      entries.push(scoreMessage(text, `${file.name} #${++index}`, index - 1));
      onProgress?.({ done: index, file: file.name });
      buffer = "";
    }
  };

  for (;;) {
    if (signal?.aborted) break;
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    await emitCompleteMessages();
  }

  buffer += decoder.decode();
  await emitCompleteMessages(true);

  return { entries, failed: entries.length ? [] : [file.name] };
}

export async function ingestFiles(fileList, options = {}) {
  const files = Array.from(fileList);
  const mboxFiles = [];
  const standardFiles = [];

  for (const file of files) {
    const sample = await file.slice(0, DETECTION_BYTES).text();
    if (isMboxSample(sample)) mboxFiles.push(file);
    else standardFiles.push(file);
  }

  const standard = standardFiles.length
    ? await ingestStandardFiles(standardFiles, options)
    : { entries: [], failed: [] };

  const mboxEntries = [];
  const failed = [...standard.failed];
  for (const file of mboxFiles) {
    if (options.signal?.aborted) break;
    const result = await ingestMbox(file, options);
    mboxEntries.push(...result.entries);
    failed.push(...result.failed);
  }

  return {
    entries: [...standard.entries, ...mboxEntries],
    failed,
  };
}
