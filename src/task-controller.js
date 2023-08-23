/**
 * Copyright 2020 Google LLC
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

import {SCHEDULER_PRIORITIES} from './scheduler-priorities.js';

/** @typedef {import('../types/scheduler.d.ts').TaskPriority} TaskPriority */

/**
 * Event type used for priority change events:
 * https://wicg.github.io/scheduling-apis/#sec-task-priority-change-event.
 */
class TaskPriorityChangeEvent extends Event {
  /**
   * Constructs a TaskPriorityChangeEvent. Events of this type are typically
   * named 'prioritychange', which is the name used for events triggered by
   * TaskController.setPriority().
   *
   * @param {string} typeArg
   * @param {{previousPriority: TaskPriority}} [init]
   */
  constructor(typeArg, init) {
    if (!init || !SCHEDULER_PRIORITIES.includes(init.previousPriority)) {
      throw new TypeError(`Invalid task priority: '${init?.previousPriority}'`);
    }
    super(typeArg);
    this.previousPriority = init.previousPriority;
  }
}

/**
 * TaskController enables changing the priority of tasks associated with its
 * TaskSignal.
 *
 * Unfortunately, we can't implement TaskSignal by extending AbortSignal because
 * we can't call its constructor. We can't implement a separate TaskSignal class
 * because we need the inheritance so that TaskSignals can be passed to other
 * APIs. We therefore modify the TaskController's underlying AbortSignal, adding
 * the priority property.
 */
class TaskController extends AbortController {
  /** @type {TaskSignal} */
  signal = TaskController.makeTaskSignal_(this);

  /**
   * @param {{priority?: TaskPriority}} init
   */
  constructor(init = {}) {
    super();

    if (init == null) init = {};
    if (typeof init !== 'object') {
      throw new TypeError(`'init' is not an object`);
    }

    const priority =
        init.priority === undefined ? 'user-visible' : init.priority;
    if (!SCHEDULER_PRIORITIES.includes(priority)) {
      throw new TypeError(`Invalid task priority: '${priority}'`);
    }

    /**
     * @private
     * @type {TaskPriority}
     */
    this.priority_ = priority;

    /**
     * @private
     * @type {boolean}
     */
    this.isPriorityChanging_ = false;
  }

  /**
   * Change the priority of all tasks associated with this controller's signal.
   * @param {TaskPriority} priority
   */
  setPriority(priority) {
    if (!SCHEDULER_PRIORITIES.includes(priority)) {
      throw new TypeError('Invalid task priority: ' + priority);
    }
    if (this.isPriorityChanging_) throw new DOMException('', 'NotAllowedError');
    if (this.signal.priority === priority) return;

    this.isPriorityChanging_ = true;

    const previousPriority = this.priority_;
    this.priority_ = priority;

    const e = new TaskPriorityChangeEvent('prioritychange', {previousPriority});
    this.signal.dispatchEvent(e);

    this.isPriorityChanging_ = false;
  }

  /**
  * Makes the controller's signal a TaskSignal by adding a read-only priority
  * property.
  * @private
  * @param {TaskController} controller
  * @return {TaskSignal}
  */
  static makeTaskSignal_(controller) {
    const signal = controller.signal;
    Object.defineProperties(signal, {
      priority: {
        get: function() {
          return controller.priority_;
        },
        enumerable: true,
      },
      onprioritychange: {
        value: null,
        writable: true,
        enumerable: true,
      },
    });
    signal.addEventListener('prioritychange', (e) => {
      if (signal.onprioritychange) {
        signal.onprioritychange(e);
      }
    });

    return signal;
  }
}

export {TaskController, TaskPriorityChangeEvent};
