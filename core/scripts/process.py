from uuid import UUID
from octopod.queue import worker_queue
from octopod.worker import tasks

if __name__ == "__main__":
    worker_queue.enqueue(
        tasks.handle_podcast,
        UUID("0191ddeb-b801-868b-943d-dd87c614bc54"),
        job_timeout=3600,
    )
