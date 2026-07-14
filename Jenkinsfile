pipeline {
    agent any

    tools {
        nodejs "NodeJS_18"  // Make sure this is the exact name in Jenkins global tool config
    }

   environment {
        /* ===============================
           AWS + CloudFront
        =============================== */
        AWS_REGION = "ap-south-1"
        S3_BUCKET  = "publications.snsihub.ai"
        CLOUDFRONT_DISTRIBUTION_ID = "E17RWJDWEYRP48"

        /* ===============================
           VITE ENV (Injected at build time)
        =============================== */
        VITE_ENABLE_MOCK = false
        VITE_RAZORPAY_KEY_ID  = "rzp_test_T8UWvt2fHT2O7a"
        VITE_API_BASE_URL = "https://publications.snsihub.ai/api"
    }


    stages {
        stage('Check Node.js & npm Versions') {
            steps {
                sh 'node -v'
                sh 'npm -v'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Check Node.js Compatibility') {
            steps {
                script {
                    def nodeVersion = sh(script: "node -v", returnStdout: true).trim().replace("v", "")
                    def majorVersion = nodeVersion.tokenize('.')[0].toInteger()
                    if (majorVersion < 20) {
                        echo "⚠️ Warning: React Router 7.5.0 recommends Node.js >= 20. You're using v${nodeVersion}."
                    }
                }
            }
        }

        stage('Build React App') {
            steps {
                sh 'CI=false npm run build'
            }
        }

        stage('Upload Build to S3') {
            steps {
                script {
                    sh """
                    aws s3 sync dist/assets s3://$S3_BUCKET/assets \
                    --region $AWS_REGION \
                    --cache-control "public,max-age=31536000,immutable"
                    aws s3 cp dist/index.html s3://$S3_BUCKET/index.html \
                    --region $AWS_REGION \
                    --cache-control "no-cache,no-store,must-revalidate"
                    """
                }
            }
        }

        stage('Invalidate CloudFront Cache') {
            steps {
                script {
                    sh """
                    aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment Successful! 🎉'
        }
        failure {
            echo '❌ Deployment Failed!'
        }
    }
}
