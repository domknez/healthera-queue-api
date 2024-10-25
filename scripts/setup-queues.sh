#!/bin/bash

aws --endpoint-url=http://localstack:4566 --region us-east-1 sqs create-queue --queue-name healthera-queue
