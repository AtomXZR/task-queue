import { TaskQueue } from "../src/index.js";

interface TaskMap {
    hello: [name: string];
}

const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Task Task", function () {
    this.timeout("60s");
    it("Shall no error", async () => {
        const tq = new TaskQueue<TaskMap>({ maxConcurrentQueues: 2 });

        tq.onTask("hello", async (name: string) => {
            await waitFor(500);
            console.log(`Hello ${name}`);
        });

        tq.onTaskEvent("finish", async () => {
            console.log(tq, "\n".repeat(5));
        });

        for (let x = 0; x < 10; x++) {
            tq.enqueue("hello", `Pie ${x + 1}`);
        }

        await tq.waitUntilFinishes();

        console.log(tq);

        return true;
    });
});
