/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export type TaskPriority = 'user-blocking' | 'user-visible' | 'background';

export type SchedulerPostTaskOptions = {
  signal?: AbortSignal | TaskSignal;
  priority?: TaskPriority;
  delay?: number;
};

export type SchedulerYieldOptions = {
  signal?: AbortSignal | TaskSignal | 'inherit';
  priority?: TaskPriority | 'inherit';
};

interface TaskPriorityChangeEventInit extends EventInit {
  previousPriority: TaskPriority;
}

declare global {
  class TaskController extends AbortController {
    constructor(init?: {priority?: TaskPriority});
    readonly signal: TaskSignal;
    setPriority(priority: TaskPriority): void;
  }

  class TaskSignal extends AbortSignal {
    readonly priority: TaskPriority;
    onprioritychange: (event: Event) => void;
  }

  class TaskPriorityChangeEvent extends Event {
    constructor(type: string, init?: TaskPriorityChangeEventInit);
    readonly previousPriority: TaskPriority;
  }

  interface Scheduler {
    postTask<T>(callback: () => T, options?: SchedulerPostTaskOptions): Promise<T>;
    yield(options?: SchedulerYieldOptions): Promise<void>;
  }

  interface Window {
    scheduler: Scheduler;
    TaskController: typeof TaskController;
    TaskPriorityChangeEvent: typeof TaskPriorityChangeEvent;
  }
}
