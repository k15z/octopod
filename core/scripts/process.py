from uuid import UUID
from octopod.queue import worker_queue
from octopod.worker import tasks

if __name__ == "__main__":
    worker_queue.enqueue(
        tasks.handle_podcast,
        UUID("0191ddeb-b801-868b-943d-dd87c614bc54"),
        job_timeout=3600,
    )
    worker_queue.enqueue(
        tasks.handle_podcast,
        UUID("0191ddee-e006-6b3f-2dc9-e9d79a82bfae"),
        job_timeout=3600,
    )
