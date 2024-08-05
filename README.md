# Components

 - Server
    - Upload files, trigger jobs, serve response when ready.
 - Worker
    - Update status in postgres.
    - Powered by https://python-rq.org/
 - Minio
 - Redis
 - Postgres

POST /api/v1/submit # submit an audio file, get an ID back
GET /api/v1/<id> # get the status of a job + results if ready?
