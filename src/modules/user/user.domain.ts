export interface User {
	id: number;
	username: string;
	name: string;
}

export interface CreateUserInput {
	username: string;
	name: string;
	password: string;
}

export interface LoginInput {
	username: string;
	password: string;
}
