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

/** @typedef {import('../types/scheduler.d.ts').TaskPriority} TaskPriority */

/**
 * The list of scheduler priorities in order from highest to lowest.
 * @type {!Array<TaskPriority>}
 */
const SCHEDULER_PRIORITIES = ['user-blocking', 'user-visible', 'background'];

export {SCHEDULER_PRIORITIES};
