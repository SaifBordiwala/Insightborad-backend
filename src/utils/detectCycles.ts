import type { AiTask } from "./task.schema";

/**
 * Detect all tasks that are part of at least one dependency cycle.
 *
 * The algorithm uses a classic DFS with WHITE / GRAY / BLACK coloring:
 * - WHITE: task has not been visited yet
 * - GRAY:  task is in the current DFS recursion stack
 * - BLACK: task and all its descendants have been fully explored
 *
 * Any edge from a GRAY node to another GRAY node indicates a back edge,
 * and therefore a cycle. All tasks on the path between those two nodes
 * are marked as being part of a cycle.
 *
 * The function is pure: it does not mutate its inputs or produce side effects.
 */
export function detectCycles(tasks: AiTask[]): Set<string> {
  // Map each task id to its direct dependency ids for quick lookup.
  const adjacency = new Map<string, string[]>();

  for (const task of tasks) {
    adjacency.set(task.id, task.dependencies ?? []);
  }

  // Color states for DFS.
  const WHITE = 0 as const;
  const GRAY = 1 as const;
  const BLACK = 2 as const;

  type Color = typeof WHITE | typeof GRAY | typeof BLACK;

  // Track the current color of each node (task id).
  const colors = new Map<string, Color>();
  for (const id of adjacency.keys()) {
    colors.set(id, WHITE);
  }

  // All task ids that are part of at least one cycle.
  const cycleNodes = new Set<string>();

  // Recursion stack to reconstruct cycles when a back edge is found.
  const stack: string[] = [];

  /**
   * Depth-first search from a given task id.
   *
   * @param id - The current task id.
   */
  const dfs = (id: string): void => {
    colors.set(id, GRAY);
    stack.push(id);

    const neighbors = adjacency.get(id) ?? [];

    for (const neighborId of neighbors) {
      // Ignore dependencies that do not correspond to any known task id.
      if (!adjacency.has(neighborId)) continue;

      const neighborColor = colors.get(neighborId) ?? WHITE;

      if (neighborColor === WHITE) {
        // Tree edge: continue DFS.
        dfs(neighborId);
      } else if (neighborColor === GRAY) {
        // Back edge: we have found a cycle.
        // All nodes from the first occurrence of neighborId in the stack
        // up to the current node are part of this cycle.
        const startIndex = stack.indexOf(neighborId);
        if (startIndex !== -1) {
          for (let i = startIndex; i < stack.length; i++) {
            const nodeId = stack[i];
            // With strict indexing rules, stack[i] is typed as string | undefined.
            // The runtime check below ensures we only add defined ids.
            if (nodeId !== undefined) {
              cycleNodes.add(nodeId);
            }
          }
        }
      }
      // If neighbor is BLACK, it has already been fully explored; nothing to do.
    }

    // Mark node as fully explored and pop from recursion stack.
    colors.set(id, BLACK);
    stack.pop();
  };

  // Launch DFS from every WHITE node to ensure we cover all components.
  for (const id of adjacency.keys()) {
    if ((colors.get(id) ?? WHITE) === WHITE) {
      dfs(id);
    }
  }

  return cycleNodes;
}

/**
 * Enrich tasks with a `status` field, marking any task that participates
 * in at least one dependency cycle as `status = "error"`.
 *
 * Tasks that are not part of any cycle are marked as `status = "ok"`.
 * This function is pure and does not mutate the original task objects.
 */
export type AiTaskWithStatus = AiTask & { status: "ok" | "error" };

export function markCyclicTasks(tasks: AiTask[]): AiTaskWithStatus[] {
  const cycleIds = detectCycles(tasks);

  return tasks.map((task) => ({
    ...task,
    status: cycleIds.has(task.id) ? "error" : "ok",
  }));
}
