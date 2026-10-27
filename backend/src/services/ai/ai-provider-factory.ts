import { AIProvider } from "./ai-provider.interface";
import { GeminiAIProvider } from "./providers/gemini.provider";

export function getAIProvider(): AIProvider {
  const providerName = (process.env.AI_PROVIDER || "gemini").toLowerCase();

  switch (providerName) {
    case "gemini":
    case "google-gemini":
      return new GeminiAIProvider();

    // Future expansion example:
    // case "openai":
    //   return new OpenAIProvider();

    default:
      throw new Error(`Unsupported AI provider configured: ${providerName}`);
  }
}
