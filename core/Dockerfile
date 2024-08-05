FROM python:3.11-slim-bookworm

WORKDIR /app

COPY Pipfile Pipfile.lock /app/
RUN pip install --upgrade pip wheel setuptools && \
    pip install --user --no-warn-script-location pipenv && \
    ~/.local/bin/pipenv install --system --deploy --ignore-pipfile --extra-pip-args=--ignore-installed && \
    rm -rf ~/.cache ~/.local

COPY octopod /app/octopod
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

EXPOSE 8000
ENTRYPOINT ["uvicorn"]
CMD ["--host", "0.0.0.0", "octopod.core.server:app"]