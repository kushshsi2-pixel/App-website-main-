import { describe, expect, it } from "vitest";

const githubToken = process.env.GITHUB_PAT;

describe("GitHub publishing configuration", () => {
  it("accepts the supplied repository access token", async () => {
    expect(githubToken).toMatch(/^ghp_/);

    const response = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${githubToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    expect(response.status).toBe(200);
    const account = (await response.json()) as { login?: string };
    expect(account.login).toBeTypeOf("string");
  });
});
