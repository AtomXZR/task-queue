class Queue<T> {
    private readonly queue: T[];

    constructor() {
        this.queue = new Array<T>();
    }

    /**
     * Enqueue new element, and returns the new size of the Queue.
     * @param { T } item The element to enqueue.
     * @returns { number } Current size of the queue
     */
    public enqueue(item: T): number {
        return this.queue.push(item);
    }

    /**
     * Dequeue an element.
     * @returns { T | null } The element, null if queue is empty.
     */
    public dequeue(): T | null {
        return this.queue.shift() ?? null;
    }

    /**
     * Get the current size of the queue
     * @returns { number } Current size of the queue
     */
    public size(): number {
        return this.queue.length;
    }
}

export default Queue;
