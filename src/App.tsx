import { useState } from "react";
import { Agent } from "@atproto/api";
import { AllConfig } from "./Config";
import { Toaster } from "react-hot-toast";
import { useMediaQuery } from "react-responsive";

export function App({ agent, login }: { login: boolean; agent: Agent }) {
	agent.app.bsky.notification.putPreferencesV2;
	const isMobile = useMediaQuery({ maxWidth: 700 });
	return (
		<>
			Sky Notify Config
			<AllConfig />
			<Toaster position={isMobile ? "bottom-center" : "bottom-left"} />
		</>
	);
}
