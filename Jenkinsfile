pipeline {
    agent any
    tools {
        nodejs "NodeJS_20"
    }
    environment {
        AWS_REGION = "ap-south-1"
        S3_BUCKET  = "publications.snsihub.ai"
        CLOUDFRONT_DISTRIBUTION_ID = "E17RWJDWEYRP48"
        VITE_ENABLE_MOCK = false
        VITE_RAZORPAY_KEY_ID = "rzp_test_T8UWvt2fHT2O7a"
    }
    stages {
        stage('Check Node & npm') {
            steps {
                sh 'node -v'
                sh 'npm -v'
            }
        }
        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    sh '''
                    rm -rf node_modules
                    npm ci || npm install
                    '''
                }
            }
        }
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                    CI=false npm run build
                    echo "----- Listing frontend directory after build -----"
                    ls -la
                    echo "----- Searching for dist/build folders -----"
                    find . -maxdepth 2 -type d \\( -iname "dist" -o -iname "build" \\)
                    '''
                }
            }
        }
        stage('Upload to S3') {
            steps {
                dir('frontend') {
                    sh '''
                    OUTPUT_DIR=""
                    if [ -d "dist" ]; then
                        OUTPUT_DIR="dist"
                    elif [ -d "build" ]; then
                        OUTPUT_DIR="build"
                    else
                        echo "ERROR: Neither dist/ nor build/ folder found after build!"
                        ls -la
                        exit 1
                    fi
                    echo "Using output directory: $OUTPUT_DIR"
                    aws s3 sync "$OUTPUT_DIR" s3://$S3_BUCKET/ \
                    --region $AWS_REGION \
                    --delete
                    '''
                }
            }
        }
        stage('Invalidate CloudFront') {
            steps {
                sh '''
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
    }
}
