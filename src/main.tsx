import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { BrowserOAuthClient, AtprotoDohHandleResolver } from "@atproto/oauth-client-browser";
import { Agent } from "@atproto/api";
import { Toaster } from "react-hot-toast";

const client = new BrowserOAuthClient({
	clientMetadata: {
		client_id: "https://skynotifyconfig.tomo-x.win/client-metadata.json",
		client_name: "skynotifyconfig",
		client_uri: "https://skynotifyconfig.tomo-x.win",
		redirect_uris: ["https://skynotifyconfig.tomo-x.win/"],
		scope: "atproto transition:generic",
		grant_types: ["authorization_code", "refresh_token"],
		response_types: ["code"],
		token_endpoint_auth_method: "none",
		application_type: "web",
		dpop_bound_access_tokens: true,
	},
	handleResolver: "https://public.api.bsky.app",
});
const result = await client.init();
const login = result?.session != null;
const agent = new Agent(result?.session ?? new URL("https://public.api.bsky.app"));
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App login={login} agent={agent} />
	</StrictMode>,
);
