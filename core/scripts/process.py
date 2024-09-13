from uuid import UUID
from octopod.queue import worker_queue
from octopod.worker import tasks

if __name__ == "__main__":
    worker_queue.enqueue(
        tasks.handle_podcast,
        UUID("0191ebf3-fe2a-19ff-d817-06e94e80b74d"),
        job_timeout=3600,
    )
    worker_queue.enqueue(
        tasks.handle_podcast,
        UUID("0191ebfc-586f-6843-b3e9-0f5af91428d5"),
        job_timeout=3600,
    )
