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

        stage('Workspace Info') {
            steps {
                sh '''
                echo "===== WORKSPACE ====="
                pwd
                ls -la
                echo

                echo "===== PROJECT STRUCTURE ====="
                find . -maxdepth 2
                '''
            }
        }

        stage('Check Node & NPM') {
            steps {
                sh '''
                node -v
                npm -v
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('frontend') {
                    sh '''
                    set -ex

                    pwd
                    ls -la

                    rm -rf node_modules
                    npm ci
                    '''
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                    set -ex

                    echo "===== BEFORE BUILD ====="
                    pwd
                    ls -la

                    echo "===== PACKAGE.JSON ====="
                    cat package.json

                    echo "===== BUILD START ====="
                    npm run build

                    echo "===== BUILD FINISHED ====="

                    echo "Current Folder:"
                    pwd

                    echo "Contents:"
                    ls -la

                    echo "Search for dist folder:"
                    find .. -type d -name dist

                    if [ ! -d dist ]; then
                        echo "ERROR: dist directory not found!"
                        echo "Workspace contents:"
                        find ..
                        exit 1
                    fi

                    echo "===== DIST CONTENT ====="
                    ls -la dist
                    '''
                }
            }
        }

        stage('Upload to S3') {
    steps {
        dir('frontend') {
            sh '''
            set -ex

            pwd
            ls -la dist

            aws sts get-caller-identity

            aws s3 ls s3://$S3_BUCKET

            aws s3 sync dist s3://$S3_BUCKET/ \
                --delete \
                --region $AWS_REGION
            '''
        }
    }
}

stage('Invalidate CloudFront') {
    steps {
        sh '''
        set -ex

        aws sts get-caller-identity

        aws cloudfront create-invalidation \
            --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
            --paths "/*"
        '''
    }
}
    }

    post {
        always {
            sh '''
            echo "===== FINAL WORKSPACE ====="
            pwd
            find . -maxdepth 3
            '''
        }

        success {
            echo "✅ Frontend deployed successfully!"
        }

        failure {
            echo "❌ Frontend deployment failed!"
        }
    }
}
