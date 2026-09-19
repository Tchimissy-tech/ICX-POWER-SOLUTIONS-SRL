import { describe, expect, it } from "vitest";
import { localizedSourceFallback, publicSources, selectChatSources } from "./chatKnowledge";

describe("chat source selection", () => {
  it("prioritises the Romanian immigration authority for work-permit questions", () => {
    const selected = selectChatSources("Quels documents dois-je vérifier pour un permis de travail en Roumanie ?");
    expect(selected.map((source) => source.id)).toContain("igi-romania");
    expect(selected.map((source) => source.id)).toContain("icx-work");
  });

  it("uses the ICX strategic-partnership context for alliance questions", () => {
    const selected = selectChatSources("Comment qualifier une alliance dans les mines et les ressources naturelles ?");
    expect(selected.map((source) => source.id)).toContain("icx-strategic-partnerships");
  });

  it("does not expose internal source summaries to the browser", () => {
    const exposed = publicSources(selectChatSources("Harvard admissions"));
    expect(exposed[0]).not.toHaveProperty("summary");
    expect(exposed.some((source) => source.id === "harvard")).toBe(true);
  });

  it("falls back to the ICX general context when no trusted match exists", () => {
    expect(selectChatSources("Question hors catalogue").map((source) => source.id)).toEqual(["icx-general"]);
  });

  it("keeps a useful, cited fallback when the model is unavailable", () => {
    const selected = selectChatSources("Permis de travail en Roumanie");
    const fallback = localizedSourceFallback("fr", selected);
    expect(fallback).toContain("Inspectoratul General pentru Imigrări");
    expect(fallback).toContain("[S1]");
  });
});
