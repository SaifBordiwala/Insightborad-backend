type Task = {
  id: string;
  dependencies: string[];
};

export function sanitizeTaskDependencies(tasks: Task[]): Task[] {
  const validIds = new Set(tasks.map((t) => t.id));

  return tasks.map((task) => ({
    ...task,
    dependencies: task.dependencies.filter((depId) => validIds.has(depId)),
  }));
}
