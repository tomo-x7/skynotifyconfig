import type { AppBskyNotificationDefs } from "@atproto/api";
import { useRef, type RefObject } from "react";
import toast from "react-hot-toast";
import z from "zod";
import "./config.css";

const FilterablePreferenceSchema = z.object({
	include: z.enum(["all", "follows"]),
	list: z.boolean(),
	push: z.boolean(),
});
const PreferenceSchema = z.object({
	list: z.boolean(),
	push: z.boolean(),
});
const configSchema = z.object({
	like: FilterablePreferenceSchema,
	follow: FilterablePreferenceSchema,
	reply: FilterablePreferenceSchema,
	mention: FilterablePreferenceSchema,
	quote: FilterablePreferenceSchema,
	repost: FilterablePreferenceSchema,
	subscribedPost: PreferenceSchema,
	likeViaRepost: FilterablePreferenceSchema,
	repostViaRepost: FilterablePreferenceSchema,
	// others扱い
	starterpackJoined: PreferenceSchema,
	unverified: PreferenceSchema,
	verified: PreferenceSchema,
});
export type config = z.infer<typeof configSchema>;

export function AllConfig() {
	const confref = useRef<config>(loadConfig());
	return (
		<>
			<table>
				<thead>
					<tr>
						<th />
						<th>プッシュ</th>
						<th>アプリ内</th>
						<th>すべて</th>
						<th>フォローのみ</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th>いいね</th>
						<FilterableConfig confref={confref} confkey="like" />
					</tr>
					<tr>
						<th>フォロー</th>
						<FilterableConfig confref={confref} confkey="follow" />
					</tr>
					<tr>
						<th>返信</th>
						<FilterableConfig confref={confref} confkey="reply" />
					</tr>
					<tr>
						<th>メンション</th>
						<FilterableConfig confref={confref} confkey="mention" />
					</tr>
					<tr>
						<th>引用</th>
						<FilterableConfig confref={confref} confkey="quote" />
					</tr>
					<tr>
						<th>リポスト</th>
						<FilterableConfig confref={confref} confkey="repost" />
					</tr>
					<tr>
						<th>購読ポスト</th>
						<Config confref={confref} confkey="subscribedPost" />
						<td />
						<td />
					</tr>
					<tr>
						<th>RPへのいいね</th>
						<FilterableConfig confref={confref} confkey="likeViaRepost" />
					</tr>
					<tr>
						<th>RPのリポスト</th>
						<FilterableConfig confref={confref} confkey="repostViaRepost" />
					</tr>
					<tr>
						<th>他すべて</th>
						<OthersConfig confref={confref} />
						<td />
						<td />
						<td />
					</tr>
				</tbody>
			</table>
			<button
				type="button"
				onClick={() => saveConfig(confref.current)}
				className="mt-3 ml-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow font-bold text-base hover:bg-blue-700 transition"
			>
				保存する
			</button>
			<div>注:"適用する"を押す前に必ず保存してください</div>
		</>
	);
}

export function loadConfig(error = false): config {
	const raw = localStorage.getItem("config");
	if (raw != null) {
		const loaded = configSchema.safeParse(JSON.parse(raw));
		if (loaded.success) {
			return loaded.data;
		} else {
			if (error) throw new Error("Invalid config");
			toast.error("設定の読み込みに失敗しました。保存されていた設定を消去します");
		}
	}
	return {
		like: { include: "all", list: true, push: true },
		follow: { include: "all", list: true, push: true },
		reply: { include: "all", list: true, push: true },
		mention: { include: "all", list: true, push: true },
		quote: { include: "all", list: true, push: true },
		repost: { include: "all", list: true, push: true },
		subscribedPost: { list: true, push: true },
		likeViaRepost: { include: "all", list: true, push: true },
		repostViaRepost: { include: "all", list: true, push: true },
		starterpackJoined: { list: true, push: true },
		unverified: { list: true, push: true },
		verified: { list: true, push: true },
	};
}
function saveConfig(conf: config) {
	const result = configSchema.safeParse(conf);
	if (result.success) {
		localStorage.setItem("config", JSON.stringify(result.data));
		toast.success("設定を保存しました");
	} else {
		toast.error("設定が破損しています");
		console.error("Invalid config:", result.error);
	}
}

function FilterableConfig({
	confref,
	confkey,
}: {
	confref: RefObject<config>;
	confkey: keyof config;
}) {
	const current = confref.current[confkey] as AppBskyNotificationDefs.FilterablePreference;
	const onChangeInclude = (e: React.ChangeEvent<HTMLInputElement>) => {
		current.include = e.currentTarget.value;
	};
	return (
		<>
			<Config confref={confref} confkey={confkey} />
			<td>
				<label>
					<input
						type="radio"
						name={`${confkey}_include`}
						value="all"
						defaultChecked={current?.include === "all"}
						onChange={onChangeInclude}
					/>
				</label>
			</td>
			<td>
				<label>
					<input
						type="radio"
						name={`${confkey}_include`}
						value="follows"
						defaultChecked={current?.include === "follows"}
						onChange={onChangeInclude}
					/>
				</label>
			</td>
		</>
	);
}
function Config({ confref, confkey }: { confref: RefObject<config>; confkey: keyof config }) {
	const current = confref.current[confkey]!;
	return (
		<>
			<td>
				<label>
					<input
						type="checkbox"
						onChange={(ev) => (current.push = ev.currentTarget.checked)}
						defaultChecked={current.push}
					/>
				</label>
			</td>
			<td>
				<label>
					<input
						type="checkbox"
						onChange={(ev) => (current.list = ev.currentTarget.checked)}
						defaultChecked={current.list}
					/>
				</label>
			</td>
		</>
	);
}

function OthersConfig({ confref }: { confref: RefObject<config> }) {
	const current = confref.current;
	const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
		current.starterpackJoined.push = ev.currentTarget.checked;
		current.unverified.push = ev.currentTarget.checked;
		current.verified.push = ev.currentTarget.checked;
	};
	return (
		<td>
			<label>
				<input type="checkbox" onChange={onChange} defaultChecked={current.starterpackJoined.push} />
			</label>
		</td>
	);
}
