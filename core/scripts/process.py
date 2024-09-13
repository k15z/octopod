from uuid import UUID
from octopod.queue import worker_queue
from octopod.worker import tasks

if __name__ == "__main__":
    worker_queue.enqueue(
        tasks.handle_podcast,
        UUID("0191c913-00bd-b3fb-0666-fe7c7d745c90"),
        job_timeout=3600,
    )
    worker_queue.enqueue(
        tasks.handle_podcast,
        UUID("0191c913-00bd-b3fb-0666-fe7c7d745c90"),
        job_timeout=3600,
    )
