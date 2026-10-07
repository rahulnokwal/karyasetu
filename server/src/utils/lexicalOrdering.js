import { SymbolTable } from "mudder";

class LexicalOrderManager {
  constructor() {
    this.lex = new SymbolTable(
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    );
  }

  calculatePosition(prevPosition = "", nextPosition = "") {
    const newPositions = this.lex.mudder(prevPosition, nextPosition, 1);
    return newPositions[0];
  }
}

export const lexicalOrdering = new LexicalOrderManager();
