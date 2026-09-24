/**
 * The role hierarchy.
 *
 * Everything in this file is decided from environment variables, and
 * accounts() rebuilds its table on every call, so the tests set
 * process.env directly and never have to reset a module.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  accountCounts,
  atLeast,
  authConfigured,
  checkCredentials,
  type Role,
} from "@/lib/auth";

const KEYS = [
  "ADMIN_USERS",
  "COMMITTEE_USERS",
  "VIEWER_USERS",
  "FUNDRAISER_USERS",
  "ADMIN_PASSWORD",
  "AUTH_SECRET",
] as const;

const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of KEYS) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
});

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

const ROLES: Role[] = ["viewer", "committee", "admin"];

describe("atLeast", () => {
  // Every ordered pair, written out, so a change to RANK cannot pass.
  const table: [Role, Role, boolean][] = [
    ["viewer", "viewer", true],
    ["viewer", "committee", false],
    ["viewer", "admin", false],
    ["committee", "viewer", true],
    ["committee", "committee", true],
    ["committee", "admin", false],
    ["admin", "viewer", true],
    ["admin", "committee", true],
    ["admin", "admin", true],
  ];

  for (const [held, needed, expected] of table) {
    it(`a ${held} ${expected ? "satisfies" : "does not satisfy"} a ${needed} requirement`, () => {
      expect(atLeast(held, needed)).toBe(expected);
    });
  }

  it("is false for nobody", () => {
    for (const min of ROLES) {
      expect(atLeast(null, min)).toBe(false);
      expect(atLeast(undefined, min)).toBe(false);
    }
  });

  it("returns a boolean, never a truthy string", () => {
    expect(atLeast("admin", "viewer")).toStrictEqual(true);
    expect(atLeast(null, "viewer")).toStrictEqual(false);
  });
});

describe("checkCredentials", () => {
  it("returns the role the name was listed under", () => {
    process.env.ADMIN_USERS = "tathagata:alpha-passphrase";
    process.env.COMMITTEE_USERS = "devraj:beta-passphrase";
    process.env.VIEWER_USERS = "probash:gamma-passphrase";

    expect(checkCredentials("tathagata", "alpha-passphrase")).toBe("admin");
    expect(checkCredentials("devraj", "beta-passphrase")).toBe("committee");
    expect(checkCredentials("probash", "gamma-passphrase")).toBe("viewer");
  });

  it("rejects a wrong passphrase of the same length", () => {
    process.env.ADMIN_USERS = "tathagata:alpha-passphrase";
    expect(checkCredentials("tathagata", "alpha-passphrasX")).toBeNull();
  });

  it("rejects a wrong passphrase of a different length", () => {
    process.env.ADMIN_USERS = "tathagata:alpha-passphrase";
    expect(checkCredentials("tathagata", "alpha")).toBeNull();
    expect(checkCredentials("tathagata", "alpha-passphrase-and-more")).toBeNull();
    expect(checkCredentials("tathagata", "")).toBeNull();
  });

  it("rejects a name that is not listed at all", () => {
    process.env.ADMIN_USERS = "tathagata:alpha-passphrase";
    expect(checkCredentials("nobody", "alpha-passphrase")).toBeNull();
  });

  it("is case-insensitive and whitespace-tolerant on the name", () => {
    process.env.ADMIN_USERS = "Tathagata:alpha-passphrase";
    expect(checkCredentials("tathagata", "alpha-passphrase")).toBe("admin");
    expect(checkCredentials("TATHAGATA", "alpha-passphrase")).toBe("admin");
    expect(checkCredentials("  TathaGata  ", "alpha-passphrase")).toBe("admin");
  });

  it("is case-sensitive on the passphrase", () => {
    process.env.ADMIN_USERS = "tathagata:alpha-passphrase";
    expect(checkCredentials("tathagata", "ALPHA-PASSPHRASE")).toBeNull();
  });

  it("gives a name in two lists the stronger role", () => {
    process.env.VIEWER_USERS = "sayak:shared-passphrase";
    process.env.COMMITTEE_USERS = "sayak:shared-passphrase";
    process.env.ADMIN_USERS = "sayak:shared-passphrase";
    expect(checkCredentials("sayak", "shared-passphrase")).toBe("admin");
    expect(accountCounts()).toEqual({ admin: 1, committee: 0, fundraiser: 0, viewer: 0 });
  });

  it("gives the stronger role when only two of the three lists name them", () => {
    process.env.VIEWER_USERS = "sayak:shared-passphrase";
    process.env.COMMITTEE_USERS = "sayak:shared-passphrase";
    expect(checkCredentials("sayak", "shared-passphrase")).toBe("committee");
  });

  it("keeps the passphrase that came with the stronger role", () => {
    // The weaker listing is discarded entirely, passphrase and all, so
    // the old viewer passphrase must stop working rather than sign the
    // person in as a viewer.
    process.env.VIEWER_USERS = "sayak:weak-passphrase";
    process.env.ADMIN_USERS = "sayak:strong-passphrase";
    expect(checkCredentials("sayak", "strong-passphrase")).toBe("admin");
    expect(checkCredentials("sayak", "weak-passphrase")).toBeNull();
  });

  it("accepts a passphrase containing a colon", () => {
    process.env.ADMIN_USERS = "tathagata:a:b:c";
    expect(checkCredentials("tathagata", "a:b:c")).toBe("admin");
  });

  it("returns null when the variables are empty or unset", () => {
    expect(checkCredentials("tathagata", "anything")).toBeNull();
    process.env.ADMIN_USERS = "";
    process.env.COMMITTEE_USERS = "   ";
    process.env.VIEWER_USERS = ",,,";
    expect(checkCredentials("tathagata", "anything")).toBeNull();
    expect(checkCredentials("", "")).toBeNull();
    expect(accountCounts()).toEqual({ admin: 0, committee: 0, fundraiser: 0, viewer: 0 });
  });

  it("skips a malformed pair but keeps the good one beside it", () => {
    // "arnab" has no colon, ":orphan" has no name, "ayan:" has no
    // passphrase. None of the three may become an account, and none of
    // them may stop "devraj" from working.
    process.env.ADMIN_USERS = "arnab,:orphan,ayan:,devraj:good-passphrase";
    expect(checkCredentials("devraj", "good-passphrase")).toBe("admin");
    expect(checkCredentials("arnab", "")).toBeNull();
    expect(checkCredentials("", "orphan")).toBeNull();
    expect(checkCredentials("ayan", "")).toBeNull();
    expect(accountCounts()).toEqual({ admin: 1, committee: 0, fundraiser: 0, viewer: 0 });
  });

  it("does not let a name with no passphrase sign in with an empty string", () => {
    process.env.ADMIN_USERS = "ayan:";
    expect(checkCredentials("ayan", "")).toBeNull();
  });

  it("does not resolve names off Object.prototype", () => {
    process.env.ADMIN_USERS = "tathagata:alpha-passphrase";
    expect(checkCredentials("constructor", "anything")).toBeNull();
    expect(checkCredentials("__proto__", "anything")).toBeNull();
    expect(checkCredentials("toString", "anything")).toBeNull();
  });

  it("honours ADMIN_PASSWORD as a lone administrator named admin", () => {
    process.env.ADMIN_PASSWORD = "the-only-passphrase";
    expect(checkCredentials("admin", "the-only-passphrase")).toBe("admin");
    expect(checkCredentials("Admin", "the-only-passphrase")).toBe("admin");
    expect(checkCredentials("admin", "wrong")).toBeNull();
  });

  it("lets an explicit ADMIN_USERS entry named admin win over ADMIN_PASSWORD", () => {
    process.env.ADMIN_USERS = "admin:from-the-list";
    process.env.ADMIN_PASSWORD = "from-the-single";
    expect(checkCredentials("admin", "from-the-list")).toBe("admin");
    expect(checkCredentials("admin", "from-the-single")).toBeNull();
  });
});

describe("accountCounts", () => {
  it("counts each kind and names nobody", () => {
    process.env.ADMIN_USERS = "a:one,b:two";
    process.env.COMMITTEE_USERS = "c:three";
    process.env.VIEWER_USERS = "d:four,e:five,f:six";
    expect(accountCounts()).toEqual({ admin: 2, committee: 1, fundraiser: 0, viewer: 3 });
  });
});

describe("authConfigured", () => {
  const LONG = "x".repeat(32);

  it("is false with no secret", () => {
    process.env.ADMIN_USERS = "a:one";
    expect(authConfigured()).toBe(false);
  });

  it("is false with a secret under 32 characters", () => {
    process.env.AUTH_SECRET = "x".repeat(31);
    process.env.ADMIN_USERS = "a:one";
    expect(authConfigured()).toBe(false);
  });

  it("is false with a secret but no accounts", () => {
    process.env.AUTH_SECRET = LONG;
    expect(authConfigured()).toBe(false);
  });

  it("is true with a long secret and at least one account of any role", () => {
    process.env.AUTH_SECRET = LONG;
    process.env.VIEWER_USERS = "probash:one";
    expect(authConfigured()).toBe(true);
  });
});
