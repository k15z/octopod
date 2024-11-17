# octopod
Podcasts. Reimagined with UMA and AI.

## usage
Put your `.env` file at the root of the project. Then, run:

```bask
docker compose up
```

For hackathon/demo purposes, I think we can get away with just running it via Docker compose and
exposing the `nginx` container to the world via a Cloudflare tunnel.

## development
For local development, you can run the API via:

```bash
cd core
pipenv run fastapi dev octopod/core/server.py
```

And the frontend via:

```bash
cd js/studio
npm run dev
```

Note that we are using the `openapi` CLI to generate the API client for the frontend. If you made
changes to the API, you can regenerate the client via:

```
openapi --input http://127.0.0.1:8000/openapi.json --output ./js/studio/src/api
npx @hey-api/openapi-ts -i http://localhost:8000/openapi.json -o src/api -c @hey-api/client-fetch
```

This will cover most development use cases. But if you also need to actually process podcasts, you 
will also need to run the Redis instance and `rq` workers via:

```bash
docker compose up --build -d
```

which will allow you to submit new podcasts and have them be processed in the background.
