# octopod
Podcasts. Reimagined with UMA and AI.

## usage
Put your `.env` file at the root of the project. Then, run:

```bask
docker compose up
```

## layout

```
/core - API
/js
    /app - UI for listeners
    /studio - UI for creators
```

## codegen

```
openapi --input http://127.0.0.1:8000/openapi.json --output ./js/studio/src/api
```
