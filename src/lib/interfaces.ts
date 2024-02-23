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
	lastUserLogged: string | undefined;
	isAnon: boolean;
	rTopics: string[];
	// currentUserFollows: string[] | undefined;
	// UserIdentifier: string | undefined;
}
export interface LoadParams {
	params: {
		r: string;
	};
}
