import { useState, use, useEffect, useRef } from "react";
import { Agent } from "@atproto/api";
import { AllConfig, loadConfig, type config } from "./Config";
import toast, { Toaster } from "react-hot-toast";
import { useMediaQuery } from "react-responsive";
import type { BrowserOAuthClient, OAuthClient } from "@atproto/oauth-client-browser";
import { createCallable } from "react-call";

export function App({ agent, login, client }: { login: boolean; agent: Agent; client: BrowserOAuthClient }) {
	const isMobile = useMediaQuery({ maxWidth: 700 });
	const confref = useRef<config>(loadConfig());
	return (
		<>
			<h1 className="text-lg font-semibold text-gray-700 mb-4 text-center tracking-tight">Sky Notify Config</h1>
			<Login client={client} />
			{login && <UserConfig agent={agent} conf={confref.current} />}
			<AllConfig confref={confref} />
			<Toaster position={isMobile ? "bottom-center" : "bottom-left"} />
		</>
	);
}

function UserConfig({ agent, conf }: { agent: Agent; conf: config }) {
	const [profile, setProfile] = useState<{
		displayName: string;
		avatar?: string;
	} | null>(null);
	useEffect(() => {
		agent.app.bsky.actor
			.getProfile({
				actor: agent.assertDid,
			})
			.then((res) => {
				if (res.success) {
					setProfile({
						displayName: res.data.displayName ?? res.data.handle,
						avatar: res.data.avatar,
					});
				} else {
					toast.error("プロフィールの取得に失敗しました。");
				}
			});
	}, [agent]);
	const attach = async () => {
		const p = attachInner(conf);
		await toast.promise(p, {
			loading: "設定を適用しています...",
			success: "設定を適用しました",
			error: "設定の適用に失敗しました",
		});
	};
	const attachInner = async (data: config) => {
		const res = await agent.app.bsky.notification.putPreferencesV2(data);
		if (!res.success) {
			console.error(res);
			throw new Error("設定の適用に失敗しました");
		}
	};

	if (profile == null) return <>loading...</>;
	return (
		<div className="flex flex-row items-center justify-center gap-6 mt-4 mb-4">
			<img src={profile.avatar} alt="Avatar" className="w-16 h-16 rounded-full border border-gray-300 shadow" />
			<div className="font-semibold text-gray-800 text-lg">{profile.displayName}</div>
			<button
				type="button"
				onClick={attach}
				className="px-6 py-2 bg-green-600 text-white rounded-lg shadow font-bold text-base hover:bg-green-700 transition"
			>
				設定を適用する
			</button>
		</div>
	);
}

function Login({ client }: { client: BrowserOAuthClient }) {
	const login = async (handle: string) => {
		try {
			await client.signIn(handle);
		} catch (e) {
			console.error(e);
			toast.error("ログインに失敗しました。");
		}
	};
	const otherLogin = async () => {
		const handle = await OtherLogin.call();
		if (handle != null) login(handle);
	};
	return (
		<div className="flex flex-row items-center justify-center my-2 space-x-2">
			<button
				type="button"
				onClick={() => login("https://bsky.social")}
				className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition text-sm"
			>
				bsky.socialでログイン
			</button>
			<button
				type="button"
				onClick={() => otherLogin()}
				className="px-4 py-2 bg-gray-200 text-gray-800 rounded shadow hover:bg-gray-300 transition text-sm"
			>
				その他のPDSでログイン
			</button>
			<OtherLogin.Root />
		</div>
	);
}
const OtherLogin = createCallable<void, string | null>(({ call }) => {
	const [handle, setHandle] = useState("");
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-gray-800/50">
			<div className="bg-white p-10 rounded shadow-md w-80 relative">
				<button
					type="button"
					onClick={() => call.end(null)}
					className="mb-4 absolute top-2 right-2 text-gray-500 hover:text-gray-700"
				>
					閉じる
				</button>
				<input
					type="text"
					value={handle}
					onChange={(e) => setHandle(e.target.value)}
					placeholder="ハンドルを入力"
					className="w-full p-2 border border-gray-300 rounded mb-4"
				/>
				<button
					type="button"
					onClick={() => call.end(handle)}
					disabled={!handle}
					className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
				>
					ログイン
				</button>
			</div>
		</div>
	);
});
