from redis import Redis
from rq import Queue
from octopod.config import config

worker_queue = Queue(connection=Redis(host=config.REDIS_HOST))
