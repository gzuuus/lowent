export interface RoomParams {
	r: string;
	rK: string;
	rP: string;
}

export interface idSignatureObj {
	pubkAuthor: string;
	idAuthor: string;
	sigAuthor: string;
}

export interface UserSettings {
	lastUserLogged?: string;
	isAnon: boolean;
	rTopics: string[];
	cTopics: string[];
	// currentUserFollows: string[] | undefined;
	// UserIdentifier: string | undefined;
}
export interface LoadParams {
	params: {
		r: string;
	};
}

export type TopicType = 'c' | 'r';

export const typeKindMapping = {
	c: 4,
	r: 1
};
