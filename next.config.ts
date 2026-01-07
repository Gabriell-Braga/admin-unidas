import type { NextConfig } from "next";

// Allow deploying under a sub-path (e.g. /admin-unidas). Set BASE_PATH env var when deploying.
const rawBasePath = process.env.BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH || "";
const cleanBasePath = rawBasePath
	? (rawBasePath.startsWith("/") ? rawBasePath : `/${rawBasePath}`).replace(/\/$/, "")
	: "";

const nextConfig: NextConfig = {
	basePath: cleanBasePath || undefined,
	assetPrefix: cleanBasePath || undefined,
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
