FROM python:3.12-slim

WORKDIR /app
COPY main.py .

RUN pip install paho-mqtt

CMD ["python", "-u", "main.py"]
