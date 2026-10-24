import { ConflictException, NotFoundException } from "chanfana";
import { TaskRepository } from "../repositories/taskRepository";
import type { Task, CreateTaskInput, UpdateTaskInput } from "../domain/task";

export class TaskService {
	constructor(private readonly repo: TaskRepository) {}

	list(page: number, isCompleted?: boolean): Promise<Task[]> {
		return this.repo.list(page, isCompleted);
	}

	async get(slug: string): Promise<Task> {
		const task = await this.repo.getBySlug(slug);
		if (!task) throw new NotFoundException();
		return task;
	}

	async create(input: CreateTaskInput): Promise<Task> {
		const existing = await this.repo.getBySlug(input.slug);
		if (existing) throw new ConflictException();
		return this.repo.create(input);
	}

	async update(slug: string, input: UpdateTaskInput): Promise<Task> {
		const existing = await this.repo.getBySlug(slug);
		if (!existing) throw new NotFoundException();
		const updated = await this.repo.update(slug, input);
		if (!updated) throw new NotFoundException();
		return updated;
	}

	async delete(slug: string): Promise<Task> {
		const task = await this.get(slug);
		await this.repo.delete(slug);
		return task;
	}
}