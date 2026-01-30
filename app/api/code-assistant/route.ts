import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST(req: Request) {
  try {
    if (!GEMINI_API_KEY) {
      return Response.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const { code, language, action, additionalContext } = await req.json();

    if (!code) {
      return Response.json({ error: "Code is required" }, { status: 400 });
    }

    // Build prompt based on action
    let prompt = "";

    switch (action) {
      case "explain":
        prompt = `You are an expert ${language} programmer. Explain the following code in detail. Break down what each part does, explain the logic, and highlight any important concepts or patterns used.

Code:
\`\`\`${language}
${code}
\`\`\`

Provide a clear, educational explanation:`;
        break;

      case "optimize":
        prompt = `You are an expert ${language} programmer. Analyze the following code and provide optimized version with improvements for:
- Performance
- Memory usage
- Code readability
- Best practices

Original Code:
\`\`\`${language}
${code}
\`\`\`

Provide the optimized code and explain the improvements:`;
        break;

      case "debug":
        prompt = `You are an expert ${language} programmer and code reviewer. Analyze the following code for:
- Potential bugs
- Security vulnerabilities
- Edge cases not handled
- Logic errors
- Type errors
- Common pitfalls

Code:
\`\`\`${language}
${code}
\`\`\`

List all issues found and suggest fixes:`;
        break;

      case "refactor":
        prompt = `You are an expert ${language} programmer. Refactor the following code to improve:
- Code structure and organization
- Readability and maintainability
- Following SOLID principles
- Design patterns where applicable
- Separation of concerns

Original Code:
\`\`\`${language}
${code}
\`\`\`

Provide the refactored code and explain the improvements:`;
        break;

      case "complete":
        const instructions = additionalContext || "Complete the code naturally";
        prompt = `You are an expert ${language} programmer. Complete the following incomplete code.
${instructions}

Incomplete Code:
\`\`\`${language}
${code}
\`\`\`

Provide the completed code:`;
        break;

      case "convert":
        const targetLang = additionalContext || "Python";
        prompt = `You are an expert programmer. Convert the following ${language} code to ${targetLang}. Maintain the same functionality and logic, but use ${targetLang} idioms and best practices.

Original ${language} Code:
\`\`\`${language}
${code}
\`\`\`

Provide the equivalent ${targetLang} code:`;
        break;

      default:
        prompt = `Analyze this ${language} code:\n\n${code}`;
    }

    // Try Gemini models with fallback (use only stable models, avoid deprecated versions)
    const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
    let result = "";

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const response = await model.generateContent(prompt);
        result = response.response.text();
        
        if (result) break;
      } catch (err) {
        console.error(`Model ${modelName} failed:`, err);
        continue;
      }
    }

    if (!result) {
      throw new Error("All models failed to analyze code");
    }

    return Response.json({ result });
  } catch (error: any) {
    console.error("Code analysis error:", error);
    return Response.json(
      { error: error?.message || "Failed to analyze code" },
      { status: 500 }
    );
  }
}
