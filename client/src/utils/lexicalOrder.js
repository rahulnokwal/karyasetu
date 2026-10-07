import { SymbolTable } from "mudder";

const symbolTable = new SymbolTable(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
);

export function calculateLexicalPosition(prevPosition = "", nextPosition = "") {
  try {
    const newPositions = symbolTable.mudder(
      prevPosition || "",
      nextPosition || "",
      1,
    );
    return newPositions[0];
  } catch (error) {
    console.error("Lexical position calculation error:", error);
    return `${prevPosition || "a"}m`;
  }
}
