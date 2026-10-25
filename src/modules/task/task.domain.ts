export interface Task {
	name: string;
	slug: string;
	description?: string;
	completed: boolean;
	due_date: string;
}

export interface CreateTaskInput {
	name: string;
	slug: string;
	description?: string;
	completed: boolean;
	due_date: string;
}

export interface UpdateTaskInput {
	name?: string;
	slug?: string;
	description?: string;
	completed?: boolean;
	due_date?: string;
}
