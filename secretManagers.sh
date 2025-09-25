#!/bin/sh

set -e 

# ----- Fetching Secret Manager ARN from Parameter Store -----
echo "Fetching from Parameter Store..."
 SECRET_MANAGER=$(aws ssm get-parameter \
    --name "/group15/asgn2/secrets" \
    --with-decryption \
    --query "Parameter.Value" \
    --output text)
echo "Successfully fetched Secret ARN: $SECRET_MANAGER"

# ----- Fetching from AWS Secret Manager -----
echo "Fetching secrets from AWS Secret Managers..."

SECRET=$(aws secretsmanager get-secret-value \
    --secret-id $SECRET_MANAGER \
    --query SecretString \
    --output text)

# ----- Parsing secret values -----
# JWT + PORT + AWS REGION
export JWT_SECRET=$(echo $SECRET | jq -r '.JWT_SECRET')
export PORT=$(echo $SECRET | jq -r '.PORT')
export AWS_REGION=$(echo $SECRET | jq -r '.AWS_REGION')

# DATABASE 
export DB_HOST=$(echo $SECRET | jq -r '.DB_HOST')
export DB_USER=$(echo $SECRET | jq -r '.DB_USER')
export DB_PASSWORD=$(echo $SECRET | jq -r '.DB_PASSWORD')
export DB_HOST=$(echo $SECRET | jq -r '.DB_HOST')
export DB_DIALECT=$(echo $SECRET | jq -r '.DB_DIALECT')
export DB_PORT=$(echo $SECRET | jq -r '.DB_PORT')


# HARVARD API KEY
export HARVARD_API_KEY=$(echo $SECRET | jq -r '.HARVARD_API_KEY')

# S3 BUCKET
export S3_BUCKET_NAME=$(echo $SECRET | jq -r '.S3_BUCKET_NAME')

# COGNITO 
export COGNITO_USER_POOL_ID=$(echo $SECRET | jq -r '.COGNITO_USER_POOL_ID')
export COGNITO_CLIENT_ID=$(echo $SECRET | jq -r '.COGNITO_CLIENT_ID')
export COGNITO_CLIENT_SECRET=$(echo $SECRET | jq -r '.COGNITO_CLIENT_SECRET')

# GOOGLE CLIENT 
export GOOGLE_CLIENT_ID=$(echo $SECRET | jq -r '.GOOGLE_CLIENT_ID')

echo "Secrets loaded into Docker environment"

# Fetching Frontend URL from Parameter Store
APP_URL=$(aws ssm get-parameter \
    --name "/group15/asgn2/frontend_url" \
    --query "Parameter.Value" \
    --output text)
export APP_URL

# ----- Run Node.js application -----
exec "$@"