import { existsSync, readFileSync } from "node:fs";
import app from "./app.mjs";

if (existsSync(new URL("../.env", import.meta.url))) {
  const envFile = readFileSync(new URL("../.env", import.meta.url), "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*?)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  }
}

const port = Number(process.env.LOCAL_API_PORT ?? 8787);
app.listen(port, () => {
  console.log(`WeatherGPT local API listening on http://localhost:${port}`);
});
