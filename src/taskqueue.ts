import { EventEmitter } from "events";
import Queue from "./queue.js";
import { AsyncFunction } from "./types.js";

//

type TaskQueueMap<T> = Record<keyof T, [...unknown[]]>;

interface TaskQueueEntry<T extends TaskQueueMap<T>> {
    task: keyof T;
    args: T[keyof T];
}

interface TaskQueueEvents<T extends TaskQueueMap<T>> {
    "task:error": [error: Error, task: TaskQueueEntry<T>];
    "task:add": [];
    "task:finish": [task: TaskQueueEntry<T>]
    "task::state:decrease": []
    "task::run": []
}

interface TaskQueueTaskEvent<T extends TaskQueueMap<T>> {
    error: [error: Error, task: TaskQueueEntry<T>];
    finish: [task: TaskQueueEntry<T>];
    "runningStateChanged:decrease": []
}

interface TaskQueueOptions {
    maxConcurrentQueues?: number;
}

interface ITaskQueueState {
    running: number;
    processing: boolean;
}

class TaskQueue<T extends TaskQueueMap<T>> {
    private readonly maxConcurrentQueues: number = 1;

    //
    private readonly queueListenerMap: Map<keyof T, Set<AsyncFunction<never, void>>>;

    private readonly queue: Queue<TaskQueueEntry<T>>;
    private readonly event: EventEmitter<TaskQueueEvents<T>>; // Internal event for states and triggering :3
    private readonly queueEvent: EventEmitter<TaskQueueTaskEvent<T>>;
    private readonly state: ITaskQueueState;

    //
    constructor(options: TaskQueueOptions = {}) {
        this.maxConcurrentQueues = 1;
        if (options.maxConcurrentQueues) {
            this.maxConcurrentQueues = options.maxConcurrentQueues > 0 ? options.maxConcurrentQueues : 1;
        }

        this.queueListenerMap = new Map<keyof T, Set<AsyncFunction<never, void>>>();

        this.queue = new Queue<TaskQueueEntry<T>>;
        this.event = new EventEmitter<TaskQueueEvents<T>>();
        this.queueEvent = new EventEmitter<TaskQueueTaskEvent<T>>();

        this.state = {
            running: 0,
            processing: false,
        };

        //

        this.event.on("task::run", () => {
            if (this.state.processing || this.isQueueEmpty()) return;
            this.run();
        });

        this.event.on("task::state:decrease", () => {
            this.state.running--;
            this.checkRunningCount();

            if (!this.isQueueEmpty()) this.event.emit("task::run");
            this.queueEvent.emit("runningStateChanged:decrease");
        });

        this.event.on("task:add", () => this.event.emit("task::run"));

        this.event.on("task:finish", (task) => {
            this.queueEvent.emit("finish", task);
            this.event.emit("task::state:decrease");
        });

        this.event.on("task:error", (err, task) => {
            this.queueEvent.emit("error", err, task);
            this.event.emit("task::state:decrease");
        });
    }

    /**
     * Ensure `running` state is not below `0`.
     */
    private checkRunningCount(): void {
        if (this.state.running < 0) this.state.running = 0;
    }

    /**
     * Checks if queue is empty.
     * @returns { boolean } `true` if queue is empty `false` otherwise.
     */
    private isQueueEmpty(): boolean {
        return this.queue.size() === 0;
    }

    /**
     * Checks if queue is empty and no running tasks.
     * @returns { boolean }
     */
    private isFinished(): boolean {
        return this.isQueueEmpty() && this.state.running === 0;
    }

    /**
     * Listens for task events like `error`, `finish`, etc...
     * @param event The name of the task event.
     * @param listener The callback function
     */
    // eslint-disable-next-line @stylistic/spaced-comment
    //@ts-expect-error Works properly but TS give error QmQ...
    public onTaskEvent<QE extends TaskQueueTaskEvent<T>, QEK extends keyof QE>(event: QEK, listener: AsyncFunction<QE[QEK], void>): void {
        // eslint-disable-next-line @stylistic/spaced-comment
        //@ts-expect-error We use async, but signature is sync so...
        this.queueEvent.on(event, listener);
    }

    // eslint-disable-next-line @stylistic/spaced-comment
    //@ts-expect-error Works properly but TS give error QmQ...
    public offTaskEvent<QE extends TaskQueueTaskEvent<T>, QEK extends keyof QE>(event: QEK, listener: AsyncFunction<QE[QEK], void>): void {
        // eslint-disable-next-line @stylistic/spaced-comment
        //@ts-expect-error We use async, but signature is sync so...
        this.queueEvent.off(event, listener);
    }

    // eslint-disable-next-line @stylistic/spaced-comment
    //@ts-expect-error Works properly but TS give error QmQ...
    public onTask<TK extends keyof T>(task: TK, listener: AsyncFunction<T[TK], void>): boolean {
        if (!task || !listener) return false;

        let listeners = this.queueListenerMap.get(task);
        if (!listeners) listeners = new Set();

        if (listeners.has(listener)) return false;
        listeners.add(listener);

        this.queueListenerMap.set(task, listeners);

        return true;
    }

    // eslint-disable-next-line @stylistic/spaced-comment
    //@ts-expect-error Works properly but TS give error QmQ...
    public offTask<TK extends keyof T>(task: TK, listener: AsyncFunction<T[TK], void>): void {
        if (!task) {
            this.queueListenerMap.clear();
            return;
        }

        if (!listener) {
            this.queueListenerMap.delete(task);
            return;
        }

        const listeners = this.queueListenerMap.get(task);
        if (listeners) {
            listeners.delete(listener);
            this.queueListenerMap.set(task, listeners);
        }
    }

    private async processQueue(queue: TaskQueueEntry<T>): Promise<void> {
        try {
            const listeners = this.queueListenerMap.get(queue.task);
            if (!listeners) return;

            for (const listener of listeners) {
                // eslint-disable-next-line @stylistic/spaced-comment
                //@ts-expect-error It is an array of args uwu.
                await listener.apply(this, queue.args);
            }
        } catch (e) {
            this.event.emit("task:error", e as Error, queue);
        } finally {
            this.event.emit("task:finish", queue);
        }
    }

    private run(): void {
        if (this.state.processing === true || this.state.running === this.maxConcurrentQueues || this.isQueueEmpty()) return;

        this.checkRunningCount();
        this.state.processing = true;

        while (this.state.running < this.maxConcurrentQueues && !this.isQueueEmpty()) {
            const queue = this.queue.dequeue();
            if (!queue) break;

            this.state.running++;
            void this.processQueue(queue);
        }

        this.state.processing = false;
    }

    public enqueue<TK extends keyof T>(task: TK, ...args: T[TK]): void {
        this.queue.enqueue({
            task: task,
            args: args,
        });

        this.event.emit("task:add");
    }

    public waitUntilFinishes(): Promise<void> {
        return new Promise((resolve) => {
            const check = () => {
                if (!this.isFinished()) return;

                this.queueEvent.off("runningStateChanged:decrease", check);

                return resolve();
            };

            this.queueEvent.on("runningStateChanged:decrease", check);
        });
    }
}

export default TaskQueue;
