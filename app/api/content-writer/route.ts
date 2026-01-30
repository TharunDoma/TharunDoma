import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST(req: Request) {
  try {
    if (!GEMINI_API_KEY) {
      return Response.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const { topic, contentType, tone, length, keywords } = await req.json();

    if (!topic) {
      return Response.json({ error: "Topic is required" }, { status: 400 });
    }

    // Build the prompt based on user inputs
    let wordCount = "300-500";
    if (length === "short") wordCount = "100-200";
    if (length === "long") wordCount = "700-1000";

    const contentTypeLabels: Record<string, string> = {
      blog: "blog post",
      article: "article",
      social: "social media post",
      product: "product description",
      email: "email",
      ad: "advertisement copy",
    };

    const keywordsText = keywords ? `\nInclude these keywords naturally: ${keywords}` : "";

    const prompt = `You are a professional content writer. Write a ${tone} ${contentTypeLabels[contentType]} about: "${topic}"

Requirements:
- Length: ${wordCount} words
- Tone: ${tone}
- Make it engaging, well-structured, and high-quality
- Include a compelling introduction and conclusion${keywordsText}
${contentType === "blog" ? "- Use clear headings and subheadings" : ""}
${contentType === "social" ? "- Make it concise and attention-grabbing with relevant hashtags" : ""}
${contentType === "product" ? "- Highlight key features and benefits" : ""}
${contentType === "email" ? "- Include a clear subject line and call-to-action" : ""}

Write the content now:`;

    // Try Gemini models with fallback (use only stable models, avoid deprecated versions)
    const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
    let content = "";

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = result.response;
        content = response.text();
        
        if (content) break;
      } catch (err) {
        console.error(`Model ${modelName} failed:`, err);
        continue;
      }
    }

    if (!content) {
      throw new Error("All models failed to generate content");
    }

    return Response.json({ content });
  } catch (error: any) {
    console.error("Content generation error:", error);
    return Response.json(
      { error: error?.message || "Failed to generate content" },
      { status: 500 }
    );
  }
}
