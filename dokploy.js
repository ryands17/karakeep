const API_URL = "https://admin.ryan17.dev/api";

async function main() {
  let raw = await fetch(`${API_URL}/project.all`, {
    headers: { "x-api-key": process.env.DOKPLOY_API_TOKEN },
  });

  let projects = await raw.json();

  let karakeepProject = projects.find((p) => p.name === "karakeep");

  raw = await fetch(`${API_URL}/compose.deploy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.DOKPLOY_API_TOKEN,
    },
    body: JSON.stringify({
      composeId: karakeepProject.compose[0].composeId,
    }),
  });

  if (!raw.ok) {
    throw new Error(`Failed to deploy: ${raw.statusText}`);
  }
}

(async () => {
  try {
    console.info("Starting deployment...");
    await main();
    console.info("Deployment finished successfully.");
  } catch (error) {
    console.error("failed to deploy:", error);
    process.exit(1);
  }
})();
