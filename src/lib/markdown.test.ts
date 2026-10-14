import { parseInline, parseMarkdown, wordCount } from "./markdown";

describe("parseInline", () => {
  it("splits bold and code tokens", () => {
    expect(parseInline("use **bold** and `code` here")).toEqual([
      { type: "text", text: "use " },
      { type: "strong", text: "bold" },
      { type: "text", text: " and " },
      { type: "code", text: "code" },
      { type: "text", text: " here" },
    ]);
  });

  it("passes plain text through", () => {
    expect(parseInline("plain")).toEqual([{ type: "text", text: "plain" }]);
  });
});

describe("parseMarkdown", () => {
  it("separates paragraphs on blank lines and joins soft breaks", () => {
    const blocks = parseMarkdown("one\ntwo\n\nthree");
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({
      type: "p",
      inlines: [{ type: "text", text: "one two" }],
    });
  });

  it("collects bullets into one list, with continuation lines", () => {
    const blocks = parseMarkdown("intro\n\n- a\n- b\n  more b\n\nafter");
    expect(blocks.map((b) => b.type)).toEqual(["p", "ul", "p"]);
    const ul = blocks[1];
    if (ul.type !== "ul") throw new Error("expected list");
    expect(ul.items).toHaveLength(2);
    expect(ul.items[1]).toEqual([{ type: "text", text: "b more b" }]);
  });

  it("keeps fenced code verbatim", () => {
    const blocks = parseMarkdown(
      "```csharp\nvar x = 1;\n\n// blank kept\n```\ntail",
    );
    expect(blocks[0]).toEqual({
      type: "code",
      lang: "csharp",
      code: "var x = 1;\n\n// blank kept",
    });
    expect(blocks[1].type).toBe("p");
  });

  it("counts words without markup", () => {
    expect(wordCount("**two** words\n\n- and `three`")).toBe(4);
  });
});
