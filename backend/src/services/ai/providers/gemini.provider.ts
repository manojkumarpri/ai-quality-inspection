import { GoogleGenAI, Type } from "@google/genai";
import { promises as fs } from "node:fs";
import { DEFECT_TYPES, type DefectType } from "../../taxonomy";
import { AIProvider, PredictionResult } from "../ai-provider.interface";

type GeminiContent = Array<{
  inlineData?: { data: string; mimeType: string };
  text?: string;
}>;

export class GeminiAIProvider implements AIProvider {
  private ai: GoogleGenAI;
  private modelName: string;
  private fallbackModelName?: string;
  private timeoutMs: number;

  constructor() {
    const apiKey = process.env.AI_API_KEY;
    this.modelName = process.env.AI_MODEL || "gemini-3.8-flash";
    this.fallbackModelName = process.env.AI_FALLBACK_MODEL;
    this.timeoutMs = Number(process.env.AI_TIMEOUT_MS ?? 60000);

    if (!apiKey) throw new Error("AI_API_KEY is required.");

    this.ai = new GoogleGenAI({
      apiKey,
      httpOptions: { timeout: this.timeoutMs },
    });
  }

  private isValidDefectType(value: unknown): value is DefectType {
    return (
      typeof value === "string" &&
      (DEFECT_TYPES as readonly string[]).includes(value)
    );
  }

  private getErrorDetails(error: unknown) {
    const err =
      typeof error === "object" && error !== null
        ? (error as Record<string, unknown>)
        : {};
    const message =
      typeof err.message === "string" ? err.message : String(error);
    let status =
      typeof err.status === "number"
        ? err.status
        : typeof err.statusCode === "number"
          ? err.statusCode
          : undefined;
    let providerStatus: string | undefined;

    try {
      const parsed: any = JSON.parse(message);
      const nested = parsed?.error || parsed;
      if (typeof nested.code === "number") status ??= nested.code;
      if (typeof nested.status === "string") providerStatus = nested.status;
    } catch {
        // The message is not JSON; use the original error details.
    }

    return {
      message,
      status,
      name: typeof err.name === "string" ? err.name : undefined,
      providerStatus,
    };
  }

  private isDailyQuotaExceeded(error: unknown): boolean {
    const { message } = this.getErrorDetails(error);
    const lower = message.toLowerCase();
    return (
      lower.includes("generate_content_free_tier_requests") ||
      lower.includes("daily quota") ||
      lower.includes("quota exceeded")
    );
  }

  private isRetryable(error: unknown): boolean {
    const { message, status, name, providerStatus } =
      this.getErrorDetails(error);
    const lower = message.toLowerCase();
    if (this.isDailyQuotaExceeded(error)) return false;
    if ([408, 500, 502, 503, 504].includes(status ?? 0)) return true;
    if (status === 429 && providerStatus !== "RESOURCE_EXHAUSTED") return true;
    return (
      name === "AbortError" ||
      lower.includes("timed out") ||
      lower.includes("experiencing high demand")
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async generateWithRetry(contents: GeminiContent, model: string) {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.ai.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                defectType: { type: Type.STRING, enum: [...DEFECT_TYPES] },
                confidence: { type: Type.NUMBER, nullable: true },
              },
              required: ["defectType", "confidence"],
            },
          },
        });
      } catch (error) {
        if (attempt === maxAttempts || !this.isRetryable(error)) throw error;
        const delay =
          800 * 2 ** (attempt - 1) + Math.floor(Math.random() * 300);
        await this.sleep(delay);
      }
    }
    throw new Error("AI_PROVIDER_UNAVAILABLE");
  }

  async classifyImage(
    imagePath: string,
    mimeType: string,
  ): Promise<PredictionResult> {
    if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
      throw new Error("AI_UNSUPPORTED_IMAGE_TYPE");
    }

    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString("base64");

    const prompt = `
You are classifying a product image for manufacturing quality inspection.
Choose exactly one category from this list: ${DEFECT_TYPES.join(", ")}
Instructions:
- Inspect only defects visually identifiable.
- Select No Defect when no supported defect is identifiable.
- Return structured JSON response with "defectType" and "confidence".
`;

    const contents: GeminiContent = [
      { inlineData: { data: base64Image, mimeType } },
      { text: prompt },
    ];

    const models = [this.modelName, this.fallbackModelName].filter(
      Boolean,
    ) as string[];
    let response: any;
    let usedModel = this.modelName;

    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      try {
        response = await this.generateWithRetry(contents, model);
        usedModel = model;
        break;
      } catch (error) {
        const hasFallback = i < models.length - 1;
        if (hasFallback && this.isDailyQuotaExceeded(error)) continue;
        throw error;
      }
    }

    const responseText = response?.text?.trim();
    if (!responseText)
      throw new Error("AI_INVALID_RESPONSE: Empty model response.");

    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      throw new Error(
        "AI_INVALID_RESPONSE: Model response was not valid JSON.",
      );
    }

    if (!parsed || !this.isValidDefectType(parsed.defectType)) {
      throw new Error("AI_INVALID_RESPONSE: Unsupported defect category.");
    }

    return {
      defectType: parsed.defectType,
      confidence:
        typeof parsed.confidence === "number" ? parsed.confidence : null,
      provider: "google-gemini",
      model: usedModel,
    };
  }
}
