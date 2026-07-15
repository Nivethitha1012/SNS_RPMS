pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

    tools {
        nodejs "NodeJS_20"
    }

    environment {
        AWS_REGION = "ap-south-1"
        S3_BUCKET = "publications.snsihub.ai"
        CLOUDFRONT_DISTRIBUTION_ID = "E17RWJDWEYRP48"
        VITE_ENABLE_MOCK = "false"
        VITE_RAZORPAY_KEY_ID = "rzp_test_T8UWvt2fHT2O7a"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Workspace') {
            steps {
                sh '''
                set -ex

                echo "Current Workspace:"
                pwd

                echo "Workspace Contents:"
                ls -la

                echo "Package.json:"
                cat package.json

                echo "Node Version:"
                node -v

                echo "NPM Version:"
                npm -v
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                set -ex

                npm ci
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                sh '''
                set -ex

                npm run build

                echo "===== Build Output ====="
                ls -la

                if [ ! -d dist ]; then
                    echo "ERROR: dist folder not found!"
                    exit 1
                fi

                echo "===== Dist Contents ====="
                ls -la dist
                '''
            }
        }

        stage('Upload to S3') {
            steps {
                sh '''
                set -ex

                aws sts get-caller-identity

                aws s3 sync dist s3://$S3_BUCKET \
                    --region $AWS_REGION \
                    --delete
                '''
            }
        }

        stage('Invalidate CloudFront') {
            steps {
                sh '''
                set -ex

                aws cloudfront create-invalidation \
                    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
                    --paths "/*"
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Frontend Deployment Successful!'
        }

        failure {
            echo '❌ Frontend Deployment Failed!'
        }

        always {
            sh '''
            echo "===== Final Workspace ====="
            pwd
            ls -la
            '''
        }
    }
}
