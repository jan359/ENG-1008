
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LECTURE_MATERIAL } from "../constants";
import { QuizConfig, Question, GradingResult, QuestionType } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

export const generateQuizQuestions = async (config: QuizConfig, weakTopics: string[]): Promise<Question[]> => {
  const totalQuestions = config.mcqCount + config.shortCount + config.longCount;
  
  let systemPrompt = `
    You are a C Programming Professor creating a PRACTICAL REVISION EXAM based on the provided "Review Questions" document.
    
    SOURCE MATERIAL:
    ${LECTURE_MATERIAL}
    
    YOU MUST GENERATE QUESTIONS THAT EXACTLY MATCH THE STYLES BELOW, INCLUDING POINTERS AND ARRAYS:

    1. TYPE: EXPRESSION EVALUATION (Best for Short Answer/MCQ)
       - Format: "Evaluate the following expression: [expression]"
       - Content: Mixed integer arithmetic, precedence, modulus, integer division.
       - Example: "5*8/2+(4-2)%3"
    
    2. TYPE: MANUAL CODE TRACING (Best for Short Answer/MCQ)
       - Format: "For the following statement/loop, write down the value(s) that will be printed."
       - Content: 
         - printf formatting (%3.1f, %05d).
         - Complex loops (comma operator, nested).
         - POINTERS: Trace value of *p, *p++, (*p)++.
         - ARRAYS: Trace array index access arr[i].
       - CONSTRAINT: Keep code snippets SHORT (3-6 lines max) for MCQs.
       - Example: "int x=10, *p=&x; (*p)++; printf(\"%d\", x);"
    
    3. TYPE: DEBUGGING / ERROR ID (Best for MCQ/Short Answer)
       - Format: "Identify the error in the following code snippet."
       - Content: Semicolons after loops, missing &, uninitialized vars, Array out of bounds, Dereferencing NULL/uninitialized pointers.
       - Example: "int a[5]; a[5] = 10;" (Out of bounds).
    
    4. TYPE: CODE WRITING (Best for Long Answer)
       - Format: "Write the C code that uses a [construct] to [task]."
       - Content: nested if-else, switch, loops, FUNCTIONS with POINTERS (pass-by-reference), ARRAY manipulation.
       - Example: "Write a function that swaps two integers using pointers."

    DIFFICULTY (${config.difficulty}):
    - Easy: Simple expressions, basic printf, basic array access.
    - Medium: Nested loops, switch cases, pointer dereferencing.
    - Hard: Pointer arithmetic (*p++ vs (*p)++), multidimensional arrays, complex precedence.

    OUTPUT RULES:
    - Generate exactly: ${config.mcqCount} MCQs, ${config.shortCount} Short Answer, ${config.longCount} Long Answer.
    - Model Answer: MUST BE EXACT. If it's code, provide valid C code. If it's a number, provide the number.
  `;

  if (config.selectedTopics && config.selectedTopics.length > 0) {
    systemPrompt += `\nCRITICAL: You MUST include questions focusing on these User Selected Topics: ${config.selectedTopics.join(", ")}.`;
  }

  if (weakTopics.length > 0) {
    systemPrompt += `\nAlso consider these weak areas for personalization: ${weakTopics.join(", ")}.`;
  }

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: [QuestionType.MCQ, QuestionType.SHORT_ANSWER, QuestionType.LONG_ANSWER] },
            topic: { type: Type.STRING },
            text: { type: Type.STRING, description: "The question text. Put the code snippet directly in here." },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "For MCQs only. 4 options." },
            correctOptionIndex: { type: Type.INTEGER },
            modelAnswer: { type: Type.STRING, description: "The exact correct output or code. For MCQs, explain WHY it is correct." }
          },
          required: ["id", "type", "topic", "text", "modelAnswer"]
        }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a revision quiz with ${totalQuestions} questions strictly following the styles in the source material.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.4, 
      }
    });

    const json = JSON.parse(response.text || "{}");
    return json.questions || [];
  } catch (error) {
    console.error("Gemini Quiz Gen Error:", error);
    throw new Error("Failed to generate quiz. Please check API Key or try again.");
  }
};

export const gradeQuestion = async (question: Question, userAnswer: string): Promise<GradingResult> => {
  const prompt = `
    You are a strict C Programming Grader grading a revision exam.
    
    Question: ${question.text}
    Model Answer: ${question.modelAnswer}
    Student Answer: ${userAnswer}

    GRADING RULES:
    1. ARITHMETIC: Answer must be the EXACT number (e.g., "7", not "7.0" if integer math).
    2. TRACING: Output formatting must match exactly (spaces, newlines, zero-padding).
    3. CODE WRITING: Logic must be correct. Syntax errors that break compilation are -10 points. Missing semicolons are -5 points.
    4. DEBUGGING: Student must identify the specific line or logical error.
    
    Output JSON with score (0-100) and specific feedback.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.INTEGER },
      feedback: { type: Type.STRING },
      modelAnswer: { type: Type.STRING }
    },
    required: ["score", "feedback", "modelAnswer"]
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.2
      }
    });

    return JSON.parse(response.text || "{}") as GradingResult;
  } catch (error) {
    console.error("Gemini Grading Error:", error);
    return {
      score: 0,
      feedback: "Error grading question. Please try again.",
      modelAnswer: question.modelAnswer || "N/A"
    };
  }
};
