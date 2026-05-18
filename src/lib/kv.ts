import fs from "fs";
import path from "path";
import { kv as vercelKv } from "@vercel/kv";

const hasVercelKv = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

class LocalKV {
  private filePath: string;
  private data: Record<string, any> = {};

  constructor() {
    // Save in /tmp/local_kv.json in Vercel/serverless environments, otherwise local root
    const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION);
    this.filePath = isServerless 
      ? path.join("/tmp", "local_kv.json") 
      : path.join(process.cwd(), ".local_kv.json");
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, "utf-8");
        this.data = JSON.parse(fileContent);
      }
    } catch (e) {
      console.warn("Failed to load local KV file, starting fresh:", e);
      this.data = {};
    }
  }

  private save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write local KV file:", e);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    this.load();
    const val = this.data[key];
    if (val === undefined) return null;
    return val as T;
  }

  async set(key: string, value: any): Promise<string> {
    this.load();
    this.data[key] = value;
    this.save();
    return "OK";
  }

  async sadd(key: string, ...members: any[]): Promise<number> {
    this.load();
    if (!Array.isArray(this.data[key])) {
      this.data[key] = [];
    }
    const currentSet = new Set(this.data[key]);
    let addedCount = 0;
    for (const member of members) {
      if (!currentSet.has(member)) {
        currentSet.add(member);
        addedCount++;
      }
    }
    this.data[key] = Array.from(currentSet);
    this.save();
    return addedCount;
  }

  async lpush(key: string, ...elements: any[]): Promise<number> {
    this.load();
    if (!Array.isArray(this.data[key])) {
      this.data[key] = [];
    }
    // Redis LPUSH inserts at the head (unshift)
    this.data[key].unshift(...elements);
    this.save();
    return this.data[key].length;
  }
}

// Export with the exact type signature of Vercel KV for complete Type Safety
export const kv: typeof vercelKv = hasVercelKv ? vercelKv : (new LocalKV() as any);
