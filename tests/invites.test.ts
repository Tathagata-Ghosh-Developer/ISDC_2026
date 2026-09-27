/**
 * The invitation tracker's parsing and ownership rules.
 */
import { describe, expect, it } from "vitest";
import { cleanEmail, matchesStatus, nameKey, ownsInvite, parseSheet } from "@/lib/invites";

describe("cleanEmail", () => {
  it("takes the first address and tidies it", () => {
    expect(cleanEmail("asha@example.org,")).toBe("asha@example.org");
    expect(cleanEmail("bikram@example.org, chair@example.org")).toBe("bikram@example.org");
    expect(cleanEmail("  Chandni.X@example.org ")).toBe("chandni.x@example.org");
  });
  it("returns null for a cell with no address", () => {
    expect(cleanEmail("Some Name")).toBeNull();
    expect(cleanEmail("")).toBeNull();
    expect(cleanEmail(null)).toBeNull();
  });
});

describe("parseSheet", () => {
  it("reads the Puja list layout and carries Division and Department down", () => {
    const text = [
      "Division\tDepartment\tName\tEmail",
      "Sci\tChem\tAsha Rao\tasha.rao@example.org",
      "\t\tBikram Sen\tbikram.sen@example.org",
      "\tCES\tChandni Pal\tchandni.pal@example.org",
      "Chem\tIPC\t\t",
      "\t\tDev Kar\tdev.kar@example.org",
    ].join("\n");
    const rows = parseSheet(text);
    expect(rows.map((r) => r.name)).toEqual(["Asha Rao", "Bikram Sen", "Chandni Pal", "Dev Kar"]);
    expect(rows[1]).toMatchObject({ division: "Sci", department: "Chem" });
    expect(rows[2]).toMatchObject({ division: "Sci", department: "CES" });
    expect(rows[3]).toMatchObject({ division: "Chem", department: "IPC" });
  });

  it("reads the faculty directory layout, with posts", () => {
    const text = [
      "Name\tPost\tDepartment\tEmail\tPhone No",
      "E.F. Gupta\tProfessor\tChemistry\tefg@example.org\t",
      "Farah Iqbal\tAssistant Professor\tChemistry\tfarah@example.org\t",
    ].join("\n");
    expect(parseSheet(text)[1]).toEqual({
      name: "Farah Iqbal",
      post: "Assistant Professor",
      department: "Chemistry",
      division: null,
      email: "farah@example.org",
    });
  });

  it("reads Division and Post together when the header names both", () => {
    const text = [
      "Division\tDepartment\tName\tPost\tEmail",
      "Mech\tMAT / BE\tJaya Menon\tProfessor\tjaya@example.org",
      "\t\tKiran Das\t\tkiran@example.org",
    ].join("\n");
    expect(parseSheet(text)).toEqual([
      { name: "Jaya Menon", post: "Professor", department: "MAT / BE", division: "Mech", email: "jaya@example.org" },
      { name: "Kiran Das", post: null, department: "MAT / BE", division: "Mech", email: "kiran@example.org" },
    ]);
  });

  it("assumes the Puja layout when there is no header", () => {
    expect(parseSheet("Bio\tMCB\tLata Roy\tlata@example.org")).toEqual([
      { name: "Lata Roy", post: null, department: "MCB", division: "Bio", email: "lata@example.org" },
    ]);
  });

  it("drops duplicates by email, and by name when there is no email", () => {
    const text = [
      "Division\tDepartment\tName\tEmail",
      "PMS\tAAP\tGita Bose\tgita@example.org",
      "\tPHY\tGita Bose\tgita@example.org",
      "\tMRC\tHari Nair\t",
      "\t\thari  nair\t",
    ].join("\n");
    expect(parseSheet(text).map((r) => r.name)).toEqual(["Gita Bose", "Hari Nair"]);
  });

  it("copes with Windows line endings and blank lines", () => {
    expect(parseSheet("Name\tPost\tDepartment\tEmail\r\n\r\nA B\tProfessor\tX\tab@example.org\r\n")).toHaveLength(1);
  });

  it("returns nothing for an empty paste", () => {
    expect(parseSheet("")).toEqual([]);
    expect(parseSheet("\n\n")).toEqual([]);
  });
});

describe("nameKey", () => {
  it("ignores case, spacing and punctuation", () => {
    expect(nameKey("gita  bose")).toBe(nameKey("Gita Bose"));
    expect(nameKey("Ira D’Cruz")).toBe(nameKey("ira d cruz"));
  });
});

describe("ownsInvite", () => {
  it("matches the account name or the contact-sheet name, ignoring case", () => {
    expect(ownsInvite("sourav", "sourav")).toBe(true);
    expect(ownsInvite("Sourav", "sourav")).toBe(true);
    expect(ownsInvite(" Sourav ", "sourav", "Sourav")).toBe(true);
    expect(ownsInvite("Shreya", "shreya", "Shreya")).toBe(true);
  });
  it("never matches someone else, a blank, or a partial name", () => {
    expect(ownsInvite("Rohit", "sourav", "Sourav")).toBe(false);
    expect(ownsInvite("", "sourav")).toBe(false);
    expect(ownsInvite(null, "sourav")).toBe(false);
    expect(ownsInvite("Sourav Das", "sourav", "Sourav")).toBe(false);
  });
});

describe("matchesStatus", () => {
  const r = (invited: boolean, paid: boolean) => ({ invited, paid });
  it("sorts rows into the three stages", () => {
    expect(matchesStatus(r(false, false), "not-invited")).toBe(true);
    expect(matchesStatus(r(true, false), "invited-unpaid")).toBe(true);
    expect(matchesStatus(r(true, true), "paid")).toBe(true);
    expect(matchesStatus(r(false, true), "paid")).toBe(true);
    expect(matchesStatus(r(false, true), "not-invited")).toBe(false);
    expect(matchesStatus(r(true, true), "all")).toBe(true);
  });
});
