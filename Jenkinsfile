pipeline {
    agent any

    stages {
        stage('Checkout Repo') {
            steps {
                echo "Repo checkout handled by Pipeline from SCM"
            }
        }

        stage('Check Environment') {
            steps {
                echo "Checking Windows environment"

                bat 'node -v'
                bat 'npm -v'
                bat 'npx playwright --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "Installing root npm dependencies"

                bat 'npm install'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                echo "Installing Playwright browsers"

                bat 'npx playwright install'
            }
        }

        stage('Build Dashboard') {
            steps {
                echo "Installing dashboard dependencies and building frontend"

                bat 'npm run dashboard:install'
                bat 'npm run dashboard:build'
            }
        }

        stage('Start Dashboard') {
            steps {
                echo "Starting dashboard in background"

                bat 'start /B npm run dashboard'
                echo "Playwright dashboard running at http://127.0.0.1:4300"
            }
        }
    }

    post {
        always {
            echo "Publishing Playwright HTML Report"

            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright HTML Report'
            ])
        }

        success {
            echo "Playwright execution completed successfully"
        }

        failure {
            echo "Playwright execution failed"
        }
    }
}
