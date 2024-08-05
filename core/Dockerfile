FROM python:3.11-slim-bookworm

WORKDIR /app

RUN apt-get update \
    && apt-get install -y ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY Pipfile Pipfile.lock /app/
RUN pip install --upgrade pip wheel setuptools && \
    pip install --user --no-warn-script-location pipenv && \
    ~/.local/bin/pipenv install --system --deploy --ignore-pipfile --extra-pip-args=--ignore-installed && \
    rm -rf ~/.cache ~/.local

COPY octopod /app/octopod
COPY scripts /app/scripts
COPY run.sh /app/
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

EXPOSE 8000
ENTRYPOINT ["bash", "run.sh"]
