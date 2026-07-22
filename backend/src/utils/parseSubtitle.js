import fs from "fs";
import path from "path";
import { parseSync } from "subtitle";
import addToPinecone from "./addToPinecone.js";
import { randomUUID } from "node:crypto";

const getSubtitleFilePath = (directory) => {
  let files = [];

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getSubtitleFilePath(fullPath));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".srt") || entry.name.endsWith(".vtt"))
    ) {
      files.push(fullPath);
    }
  }

  return files;
};

const subtitleFiles = getSubtitleFilePath("./src/assets/class-subtitle");

const modifySchema = async () => {
  for (const file of subtitleFiles) {
    const subtitles = parseSubtitle(file);

    const chunks = subtitles
      .filter((cue) => cue.type === "cue")
      .map((cue, index) => {
        return {
          id: randomUUID(),
          text: cue.data.text,
          start: cue.data.start,
          end: cue.data.end,
        };
      });
    await addToPinecone(chunks);
  }
};

export const parseSubtitle = (file) => {
  const fileContent = fs.readFileSync(file, "utf-8");
  const subtitles = parseSync(fileContent);
  return subtitles;
};

const chunks = modifySchema();
