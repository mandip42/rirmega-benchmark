import { describe, it, expect } from "vitest";
import { links, dataset, citation, tracks, VERIFIED_ON } from "../lib/facts";

describe("verified facts integrity", () => {
  it("all links are absolute https URLs", () => {
    for (const [k, v] of Object.entries(links)) {
      expect(v, k).toMatch(/^https:\/\//);
    }
  });

  it("dataset split counts sum to the total", () => {
    const { train, validation, test, total } = dataset.rows;
    expect(train + validation + test).toBe(total);
  });

  it("citation BibTeX references the verified arXiv id and DOI", () => {
    expect(citation.paperBibtex).toContain("2510.18917");
    expect(citation.datasetBibtex).toContain(citation.doi);
  });

  it("there are exactly three tracks A/B/C", () => {
    expect(tracks.map((t) => t.id)).toEqual(["A", "B", "C"]);
  });

  it("verified-on date is set", () => {
    expect(VERIFIED_ON).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
